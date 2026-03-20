import {
  BookLevel,
  SwapBook,
  SwapInputType,
  SwapRoute,
} from "@/lib/types/swap";

import {
  DEFAULT_QUOTE_ASSET_NAMES,
  DIRECT_SWAP_FEE,
  ROUTED_SWAP_FEE,
} from "../constants";

/** Calculate mid price from top-of-book bid and ask */
export const midPrice = (bids: BookLevel[], asks: BookLevel[]): number => {
  const topBid = bids[0];
  const topAsk = asks[0];
  if (!topBid || !topAsk) return 0;
  return (parseFloat(topBid.px) + parseFloat(topAsk.px)) / 2;
};

/** Check if a token is a quote/stablecoin asset */
export const isQuoteAsset = (name: string) =>
  DEFAULT_QUOTE_ASSET_NAMES.includes(name);

type SimulateResult = {
  outputAmount: number;
  impact: number;
  insufficientLiquidity: boolean;
};

/**
 * Simulate filling an order against one side of the book.
 * Walks the book levels consuming liquidity until `amountIn` is filled.
 *
 * @param levels - bid or ask levels to fill against
 * @param amountIn - the amount to fill (in base for sells, in quote for buys)
 * @param isBuy - true if buying (consuming asks), false if selling (consuming bids)
 */
export const simulateFill = (
  levels: BookLevel[],
  amountIn: number,
  isBuy: boolean,
): SimulateResult => {
  if (!levels.length) {
    return { outputAmount: 0, impact: 5, insufficientLiquidity: true };
  }

  let remaining = amountIn;
  let totalOutput = 0;

  for (const level of levels) {
    if (remaining <= 0) break;

    const px = parseFloat(level.px);
    const sz = parseFloat(level.sz);

    if (isBuy) {
      // Buying: spending quote to get base. amountIn is in quote.
      const costAtLevel = px * sz; // max quote we can spend at this level
      const spend = Math.min(remaining, costAtLevel);
      totalOutput += spend / px;
      remaining -= spend;
    } else {
      // Selling: spending base to get quote. amountIn is in base.
      const fill = Math.min(remaining, sz);
      totalOutput += fill * px;
      remaining -= fill;
    }
  }

  const insufficientLiquidity = remaining > 0;
  const midPx = levels.length > 0 ? parseFloat(levels[0].px) : 0;
  const avgPx =
    amountIn > 0
      ? isBuy
        ? amountIn / totalOutput
        : totalOutput / amountIn
      : 0;
  const impact = midPx > 0 ? Math.abs(avgPx - midPx) / midPx : 0;

  return { outputAmount: totalOutput, impact, insufficientLiquidity };
};

type FindBestRouteParams = {
  fromToken: string;
  toToken: string;
  amountIn: number;
  fromBook: SwapBook | null;
  toBook: SwapBook | null;
  isBuyMarket: boolean;
  activeInput: SwapInputType;
};

/**
 * Find the best route for a swap, handling both direct and routed swaps.
 * Direct: base → quote or quote → base (single leg)
 * Routed: base → USDC → base (two legs via quote intermediary)
 */
export const findBestRoute = (
  params: FindBestRouteParams,
): SwapRoute | null => {
  const { fromToken, toToken, amountIn, fromBook, toBook, activeInput } =
    params;

  const isFromQuote = DEFAULT_QUOTE_ASSET_NAMES.includes(fromToken);
  const isToQuote = DEFAULT_QUOTE_ASSET_NAMES.includes(toToken);
  const isDirect = isFromQuote || isToQuote;

  if (isDirect) {
    return simulateDirectSwap(
      fromToken,
      toToken,
      amountIn,
      fromBook || toBook,
      isFromQuote,
      activeInput,
    );
  }

  // Routed swap: fromToken → USDC → toToken
  if (!fromBook || !toBook) return null;

  return simulateRoutedSwap(
    fromToken,
    toToken,
    amountIn,
    fromBook,
    toBook,
    activeInput,
  );
};

function simulateDirectSwap(
  fromToken: string,
  toToken: string,
  amountIn: number,
  book: SwapBook | null,
  isBuy: boolean,
  activeInput: SwapInputType,
): SwapRoute | null {
  if (!book) return null;

  // When user enters buy amount, flip the fill direction to derive the sell amount
  const fillDirection = activeInput === "buy" ? !isBuy : isBuy;
  const levels = fillDirection ? book.asks : book.bids;

  const result = simulateFill(levels, amountIn, fillDirection);

  const isBuyInput = activeInput === "buy";

  return {
    path: [fromToken, toToken],
    fromAmounts: [isBuyInput ? result.outputAmount : amountIn],
    assetIds: [book.assetId],
    rate: isBuyInput
      ? amountIn / result.outputAmount
      : result.outputAmount / amountIn,
    toAmount: isBuyInput ? amountIn : result.outputAmount,
    impact: result.impact,
    insufficientLiquidity: result.insufficientLiquidity,
    fee: DIRECT_SWAP_FEE,
    mids: [midPrice(book.bids, book.asks)],
  };
}

function simulateRoutedSwap(
  fromToken: string,
  toToken: string,
  amountIn: number,
  fromBook: SwapBook,
  toBook: SwapBook,
  activeInput: SwapInputType,
): SwapRoute | null {
  if (activeInput === "sell") {
    // Leg 1: sell fromToken → USDC (sell base into bids)
    const leg1 = simulateFill(fromBook.bids, amountIn, false);
    if (leg1.insufficientLiquidity) {
      return buildRoutedResult(
        fromToken,
        toToken,
        fromBook,
        toBook,
        amountIn,
        leg1,
        { outputAmount: 0, impact: 0, insufficientLiquidity: true },
      );
    }

    // Leg 2: buy toToken with USDC (buy base from asks)
    const leg2 = simulateFill(toBook.asks, leg1.outputAmount, true);

    return buildRoutedResult(
      fromToken,
      toToken,
      fromBook,
      toBook,
      amountIn,
      leg1,
      leg2,
    );
  }

  // activeInput === "buy": user entered desired buy amount
  // Flip direction: simulate selling the buy amount through the reverse path
  // Leg 1: sell buyAmount of toToken into toBook bids → get USDC
  const leg1 = simulateFill(toBook.bids, amountIn, false);
  if (leg1.insufficientLiquidity) {
    return {
      path: [fromToken, "USDC", toToken],
      fromAmounts: [0, 0],
      assetIds: [fromBook.assetId, toBook.assetId],
      rate: 0,
      toAmount: amountIn,
      impact: 0,
      insufficientLiquidity: true,
      fee: ROUTED_SWAP_FEE,
      mids: [
        midPrice(fromBook.bids, fromBook.asks),
        midPrice(toBook.bids, toBook.asks),
      ],
    };
  }

  // Leg 2: buy fromToken with USDC from fromBook asks → get fromToken amount
  const leg2 = simulateFill(fromBook.asks, leg1.outputAmount, true);

  return {
    path: [fromToken, "USDC", toToken],
    fromAmounts: [leg2.outputAmount, leg1.outputAmount],
    assetIds: [fromBook.assetId, toBook.assetId],
    rate: amountIn / leg2.outputAmount,
    toAmount: amountIn,
    impact: leg1.impact + leg2.impact,
    insufficientLiquidity:
      leg1.insufficientLiquidity || leg2.insufficientLiquidity,
    fee: ROUTED_SWAP_FEE,
    mids: [
      midPrice(fromBook.bids, fromBook.asks),
      midPrice(toBook.bids, toBook.asks),
    ],
  };
}

function buildRoutedResult(
  fromToken: string,
  toToken: string,
  fromBook: SwapBook,
  toBook: SwapBook,
  amountIn: number,
  leg1: SimulateResult,
  leg2: SimulateResult,
): SwapRoute {
  return {
    path: [fromToken, "USDC", toToken],
    fromAmounts: [amountIn, leg1.outputAmount],
    assetIds: [fromBook.assetId, toBook.assetId],
    rate: leg2.outputAmount / amountIn,
    toAmount: leg2.outputAmount,
    impact: leg1.impact + leg2.impact,
    insufficientLiquidity:
      leg1.insufficientLiquidity || leg2.insufficientLiquidity,
    fee: ROUTED_SWAP_FEE,
    mids: [
      midPrice(fromBook.bids, fromBook.asks),
      midPrice(toBook.bids, toBook.asks),
    ],
  };
}
