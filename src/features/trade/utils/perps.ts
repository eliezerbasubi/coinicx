import {
  ActiveAssetDataResponse,
  AllDexsClearinghouseStateWsEvent,
} from "@nktkas/hyperliquid";

import { OrderBook } from "@/lib/types/orderbook";
import { OrderType } from "@/lib/types/trade";

import { isLimitOrder } from "./orderTypes";

export const isBuilderDeployedAsset = (asset: string) => {
  return asset.includes(":");
};

export const parseBuilderDeployedAsset = (coin: string) => {
  if (isBuilderDeployedAsset(coin)) {
    const [dex, base] = coin.split(":");
    return { dex, base };
  }

  return { dex: "", base: coin };
};

export const parseQuoteAsset = (quote?: string) => {
  if (!quote || quote.includes("/USDC")) return "USDC";

  return quote;
};

export const estimateSlippagePercent = (params: {
  orderSize: number;
  midPx: number;
  orderBook: OrderBook;
  isBuyOrder: boolean;
}) => {
  const { orderSize, midPx, orderBook, isBuyOrder } = params;
  if (orderSize === 0) {
    return 0;
  }

  if (midPx) {
    const levels = isBuyOrder ? orderBook.asks : orderBook.bids;

    let accumulatedNotional = 0;
    let remainingSize = orderSize;

    for (const level of levels) {
      const levelSize = parseFloat(level.sz);
      const levelPx = parseFloat(level.px);

      if (remainingSize - levelSize <= 0) {
        accumulatedNotional += remainingSize * levelPx;
        remainingSize = 0;
        break;
      }

      remainingSize -= levelSize;
      accumulatedNotional += levelSize * levelPx;
    }

    const filledSize = orderSize - remainingSize;

    // Not enough liquidity
    if (filledSize < 1e-6) {
      return null;
    }

    const avgExecutionPx = accumulatedNotional / filledSize;

    const priceImpact =
      Math.abs(1 - avgExecutionPx / midPx) * (orderSize / filledSize);

    return 100 * priceImpact;
  }

  return null;
};

export const calculateOrderValue = (params: {
  orderSize: number;
  referencePx: number;
  limitPx?: number;
  orderType: OrderType;
}) => {
  if (isLimitOrder(params.orderType)) {
    return params.orderSize * (params.limitPx ?? 0);
  }

  return params.orderSize * (params.referencePx ?? 0);
};

export const calculateMarginRequired = (params: {
  orderValue: number;
  userLeverage: number;
  isReduceOnly: boolean;
}) => {
  if (params.orderValue === 0 || params.isReduceOnly) {
    return 0;
  }
  return params.orderValue / params.userLeverage;
};

const calculateCrossLiquidationPrice = (params: {
  markPx: number;
  floatSide: 1 | -1;
  marginAvailable: number;
  totalNtlPos: number;
  absPosition: number;
  maxLeverage: number;
}) => {
  const {
    markPx,
    floatSide,
    marginAvailable,
    totalNtlPos,
    absPosition,
    maxLeverage,
  } = params;

  if (absPosition === 0) {
    return null;
  }

  const liquidationPrice =
    markPx -
    (floatSide * (marginAvailable - totalNtlPos / (2 * maxLeverage))) /
      absPosition /
      (1 - floatSide / (2 * maxLeverage));

  if (liquidationPrice <= 0 || liquidationPrice > 1e15) {
    return null;
  }

  return liquidationPrice;
};

/**
 * Calculates isolated-margin liquidation price.
 *
 * This function:
 * - Applies position reduction logic first
 * - Applies position increase logic second
 * - Tracks isolated margin (rawUsd) correctly
 * - Uses the same liquidation equation as cross, but on isolated equity
 *
 * @param markPx Reference price (mark / effective price)
 * @param floatSide +1 for buy orders, -1 for sell orders
 * @param leverage User leverage configuration
 * @param positionSzi Existing position size
 * @param orderSize User order size (absolute)
 * @param updatedPosition Final signed position after order execution
 * @param maxLeverage Asset max leverage
 * @returns Liquidation price or null if invalid
 */
const calculateIsolatedLiquidationPrice = (params: {
  markPx: number;
  floatSide: 1 | -1;
  leverage: {
    value: number;
    rawUsd: number;
  };
  positionSzi: number;
  orderSize: number;
  updatedPosition: number;
  maxLeverage: number;
}) => {
  const {
    markPx,
    floatSide,
    leverage,
    orderSize,
    updatedPosition,
    maxLeverage,
  } = params;

  let positionSzi = params.positionSzi;

  let signedOrderSize = floatSide * orderSize;

  let isolatedMarginUsd = leverage.rawUsd;

  /* ──────────────────────────────
   * 1. POSITION REDUCTION PHASE
   *    (closing opposite direction)
   * ────────────────────────────── */
  const isBuyOrder = signedOrderSize > 0;
  const isLong = positionSzi > 0;

  if (positionSzi !== 0 && isBuyOrder !== isLong) {
    const reducedSize = Math.min(
      Math.abs(signedOrderSize),
      Math.abs(positionSzi),
    );

    const signedReduction = signedOrderSize < 0 ? -reducedSize : reducedSize;

    const releasedMargin =
      (reducedSize / Math.abs(positionSzi)) *
      (isolatedMarginUsd + markPx * positionSzi);

    isolatedMarginUsd -= releasedMargin;
    signedOrderSize -= signedReduction;
    positionSzi += signedReduction;

    isolatedMarginUsd -= markPx * signedReduction;
  }

  /* ──────────────────────────────
   * 2. POSITION INCREASE PHASE
   *    (same direction or new position)
   * ────────────────────────────── */
  if (positionSzi === 0 || isBuyOrder === isLong) {
    isolatedMarginUsd += Math.abs(markPx * signedOrderSize) / leverage.value;

    positionSzi += signedOrderSize;
    isolatedMarginUsd -= markPx * signedOrderSize;
  }

  if (positionSzi === 0) {
    isolatedMarginUsd = 0;
  }

  /* ──────────────────────────────
   * 3. LIQUIDATION PRICE SOLVE
   * ────────────────────────────── */
  const liveAccountValue = updatedPosition * markPx + isolatedMarginUsd;
  const liquidationSide = updatedPosition > 0 ? 1 : -1;
  const totalNotional = Math.abs(updatedPosition) * markPx;

  const liquidationPrice =
    markPx -
    (liquidationSide * (liveAccountValue - totalNotional / (2 * maxLeverage))) /
      Math.abs(updatedPosition) /
      (1 - liquidationSide / (2 * maxLeverage));

  if (
    liquidationPrice <= 0 ||
    liquidationPrice > 1e15 ||
    updatedPosition === 0
  ) {
    return null;
  }

  return liquidationPrice;
};

const getCurrentPosition = (
  clearinghouseState:
    | AllDexsClearinghouseStateWsEvent["clearinghouseStates"][number][1]
    | null,
  assetName: string,
) => {
  if (!clearinghouseState?.assetPositions) return null;

  const position = clearinghouseState.assetPositions.find(
    (pos) => pos.position.coin === assetName,
  );

  return position?.position ?? null;
};

/**
 * Estimate liquidation price for a potential order, taking into account existing position and order size.
 *
 * @param orderSize - New order size
 * @param entryPrice - Current mark price or entry price
 * @param leverage - User leverage configuration
 * @param clearinghouseState - Current clearinghouse state with account and position info
 * @param assetName - Asset name to identify existing position
 * @param isBuyOrder - Whether the order is a buy or sell
 * @param maxLeverage - Asset max leverage
 * @returns
 */
export const estimateLiquidationPrice = (params: {
  orderSize: number;
  entryPrice: number;
  leverage: ActiveAssetDataResponse["leverage"] | null;
  clearinghouseState:
    | AllDexsClearinghouseStateWsEvent["clearinghouseStates"][number][1]
    | null;
  assetName: string;
  isBuyOrder: boolean;
  maxLeverage: number;
  midPx: number;
}) => {
  const {
    orderSize,
    entryPrice,
    leverage,
    clearinghouseState,
    assetName,
    isBuyOrder,
    maxLeverage,
    midPx,
  } = params;

  if (!leverage || !clearinghouseState || orderSize === 0) {
    return null;
  }

  const currentPosition = getCurrentPosition(clearinghouseState, assetName);
  const accountValue = parseFloat(
    clearinghouseState.crossMarginSummary.accountValue ?? "0",
  );
  const crossMaintenanceUsed = parseFloat(
    clearinghouseState.crossMaintenanceMarginUsed ?? "0",
  );

  const positionMarginOffset = currentPosition
    ? parseFloat(currentPosition.marginUsed) / 2
    : 0;

  const orderValue = Math.abs(orderSize) * entryPrice;
  const marginRequired = orderValue / leverage.value;

  const availableMargin = Math.max(
    accountValue - crossMaintenanceUsed + positionMarginOffset,
    marginRequired,
  );

  const direction = isBuyOrder ? 1 : -1;

  const updatedPositionSize =
    (currentPosition
      ? parseFloat(currentPosition.szi) *
        (parseFloat(currentPosition.szi) > 0 ? 1 : -1)
      : 0) +
    orderSize * direction;

  const absPosition = Math.abs(updatedPositionSize);

  let referencePrice = midPx;
  if (entryPrice > referencePrice !== isBuyOrder) {
    referencePrice = entryPrice;
  }

  const positionNotional = entryPrice * absPosition;

  const floatSide = updatedPositionSize > 0 ? 1 : -1;

  return leverage.type === "cross"
    ? calculateCrossLiquidationPrice({
        markPx: referencePrice,
        floatSide,
        marginAvailable: Math.max(
          availableMargin,
          positionNotional / leverage.value,
        ),
        totalNtlPos: positionNotional,
        absPosition,
        maxLeverage,
      })
    : calculateIsolatedLiquidationPrice({
        markPx: referencePrice,
        floatSide: direction,
        leverage: {
          rawUsd: parseFloat(leverage.rawUsd ?? "0"),
          value: leverage.value,
        },
        positionSzi: parseFloat(currentPosition?.szi ?? "0"),
        orderSize,
        updatedPosition: updatedPositionSize,
        maxLeverage,
      });
};
