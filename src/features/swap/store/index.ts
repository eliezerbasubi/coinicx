import { OrderParameters } from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import {
  BookLevel,
  SwapBook,
  SwapInputType,
  SwapSpotToken,
  SwapRoute,
} from "@/lib/types/swap";
import { parseOrderPriceWithSlippage } from "@/features/trade/utils";
import {
  formatSize,
  removeTrailingZeros,
} from "@/features/trade/utils/formatting";

import { DEFAULT_SELL_ASSET } from "../constants";
import { findBestRoute, isQuoteAsset } from "../utils/swap";

type SwapState = {
  slippage: number;
  sellToken: SwapSpotToken | null;
  buyToken: SwapSpotToken | null;
  sellAmount: string;
  buyAmount: string;
  /** Tracks which input the user last edited */
  activeInput: SwapInputType;
  /** Orderbook for sell token's spot pair */
  sellBook: SwapBook | null;
  /** Orderbook for buy token's spot pair */
  buyBook: SwapBook | null;
  /** Computed best route for the current token pair */
  route: SwapRoute | null;
};

type SwapActions = {
  setSlippage: (slippage: number) => void;
  setActiveInput: (activeInput: SwapInputType) => void;
  selectToken: (token: SwapSpotToken, type: SwapInputType) => void;
  onValueChange: (amount: string, type: SwapInputType) => void;
  switchTokens: () => void;
  setRoute: (route: SwapRoute | null) => void;
  applyBookUpdate: (
    side: SwapInputType,
    book: {
      bids: BookLevel[];
      asks: BookLevel[];
      assetId: number;
    },
  ) => void;
  getSwapOrders: () => OrderParameters["orders"];
  recalculate: () => void;
  reset: () => void;
};

type SwapStore = SwapState & SwapActions;

const initialState: SwapState = {
  slippage: 0.5,
  sellToken: DEFAULT_SELL_ASSET,
  buyToken: null,
  sellAmount: "",
  buyAmount: "",
  activeInput: "sell",
  sellBook: null,
  buyBook: null,
  route: null,
};

export const useSwapStore = create<SwapStore>()((set, get) => ({
  ...initialState,

  setSlippage: (slippage) => set({ slippage }),

  selectToken: (token, type) => {
    const { buyToken, sellToken, switchTokens, recalculate } = get();

    const key = type === "buy" ? "buyToken" : "sellToken";
    const currentToken = type === "buy" ? buyToken : sellToken;

    if (currentToken && token.name === currentToken.name) {
      return switchTokens();
    }

    set({ [key]: token, route: null });

    recalculate();
  },

  onValueChange: (amount, type) => {
    const { recalculate } = get();

    const key = type === "buy" ? "buyAmount" : "sellAmount";
    set({ [key]: amount, activeInput: type });
    recalculate();
  },

  setActiveInput(activeInput) {
    set({ activeInput });
  },

  switchTokens: () => {
    const {
      sellToken,
      buyToken,
      sellBook,
      buyBook,
      sellAmount,
      buyAmount,
      activeInput,
    } = get();
    set({
      sellToken: buyToken,
      buyToken: sellToken,
      sellBook: buyBook,
      buyBook: sellBook,
      sellAmount: buyAmount,
      buyAmount: sellAmount,
      activeInput: activeInput === "sell" ? "buy" : "sell",
      route: null,
    });
    get().recalculate();
  },

  setRoute: (route) => {
    const { activeInput } = get();
    if (route) {
      const key = activeInput === "sell" ? "buyAmount" : "sellAmount";
      const amount =
        activeInput === "sell" ? route.toAmount : route.fromAmounts[0];

      set({
        [key]: removeTrailingZeros(amount.toFixed(8)),
        route,
      });
    }
  },

  applyBookUpdate: (side, book) => {
    const state = get();
    const currentBook = side === "sell" ? state.sellBook : state.buyBook;

    // Top-of-book check: only update if the top bid or ask changed
    if (currentBook) {
      const oldTopBid = currentBook.bids[0];
      const oldTopAsk = currentBook.asks[0];
      const newTopBid = book.bids[0];
      const newTopAsk = book.asks[0];

      const bidUnchanged =
        oldTopBid?.px === newTopBid?.px && oldTopBid?.sz === newTopBid?.sz;
      const askUnchanged =
        oldTopAsk?.px === newTopAsk?.px && oldTopAsk?.sz === newTopAsk?.sz;

      if (bidUnchanged && askUnchanged) return;
    }

    set({ [side === "sell" ? "sellBook" : "buyBook"]: book });
    get().recalculate();
  },

  getSwapOrders: () => {
    const { sellToken, buyToken, route, slippage, sellAmount } = get();

    if (!sellToken || !buyToken || !route) {
      throw new Error("Please select tokens and enter an amount");
    }

    if (route.insufficientLiquidity) {
      throw new Error("Insufficient liquidity for this swap");
    }

    const sellAmt = parseFloat(sellAmount);
    if (sellAmt <= 0) {
      throw new Error("Enter a valid amount");
    }

    if (sellAmt > parseFloat(sellToken.balance || "0")) {
      throw new Error(`Insufficient ${sellToken.name} balance`);
    }

    const orders: OrderParameters["orders"] = [];

    for (let index = 0; index < route.path.length; index++) {
      const base = route.path[index];
      const quote = route.path[index + 1];
      const inputAmount = route.fromAmounts[index];
      const midPrice = route.mids[index];
      const assetId = route.assetIds[index];

      if (!quote) continue;

      // Combine user slippage + route price impact
      const slippagePct = slippage / 100;
      const totalSlippage = slippagePct + route.impact / 100;

      const isBuyMarket = isQuoteAsset(base);

      const szDecimals = isBuyMarket
        ? buyToken.szDecimals
        : sellToken.szDecimals;

      const entryPrice = parseOrderPriceWithSlippage({
        entryPrice: midPrice,
        isBuyOrder: isBuyMarket,
        slippage: totalSlippage,
        decimals: szDecimals,
      });

      // Check if the order value is greater than minimum amount
      const priceNotional = inputAmount * midPrice;
      if (priceNotional < 10) {
        throw new Error("Smallest order must have a minimum value of 10 USD");
      }

      const size = isBuyMarket ? inputAmount / midPrice : inputAmount;

      orders.push({
        a: assetId,
        b: isBuyMarket,
        s: formatSize(size, szDecimals),
        p: entryPrice.toString(),
        r: false,
        t: {
          limit: {
            tif: "Gtc",
          },
        },
      });
    }

    return orders;
  },

  recalculate: () => {
    const {
      sellToken,
      buyToken,
      sellBook,
      buyBook,
      sellAmount,
      buyAmount,
      activeInput,
      setRoute,
    } = get();

    const isSell = activeInput === "sell";

    if (!sellToken || !buyToken || (!sellBook && !buyBook)) return;

    const isRouted =
      !isQuoteAsset(sellToken.name) && !isQuoteAsset(buyToken.name);
    const isDirect = !isRouted;

    // Determine the input amount based on which field the user is editing
    const inputAmount = isSell ? parseFloat(sellAmount) : parseFloat(buyAmount);

    if (!inputAmount || isNaN(inputAmount)) {
      set({
        route: null,
        ...(isSell ? { buyAmount: "" } : { sellAmount: "" }),
      });
      return;
    }

    if (isDirect) {
      const book = sellBook || buyBook;
      if (!book) return;

      const isSellingSellToken = isSell;
      const isSellQuote = isQuoteAsset(sellToken.name);

      // Determine if we're buying from asks or selling into bids
      const isBuy = isSellQuote ? isSellingSellToken : !isSellingSellToken;
      const route = findBestRoute({
        fromToken: sellToken.name,
        toToken: buyToken.name,
        amountIn: inputAmount,
        fromBook: isBuy ? null : book,
        toBook: isBuy ? book : null,
        isBuyMarket: isBuy,
        activeInput,
      });

      setRoute(route);
    } else {
      // Routed swap: sell → USDC → buy
      if (!sellBook || !buyBook) return;

      const route = findBestRoute({
        fromToken: sellToken.name,
        toToken: buyToken.name,
        amountIn: inputAmount,
        fromBook: sellBook,
        toBook: buyBook,
        isBuyMarket: false,
        activeInput,
      });

      setRoute(route);
    }
  },

  reset: () => set(initialState),
}));

export const useShallowSwapStore = <T>(
  selector: (state: SwapStore) => T,
) => useSwapStore(useShallow(selector));
