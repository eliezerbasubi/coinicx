import { OrderType } from "@/lib/types/trade";

import { isLimitOrder } from "./orderTypes";
import { roundToDecimals } from "./prices";

export const isUSDCQuote = (quote?: string) => {
  return quote === "PURR/USDC" || quote === "USDC";
};

/**
 * Calculates the maximum trade size based on the available balance, side, and the current price.
 */
export const calculateMaxTradeSize = (params: {
  isSpot: boolean;
  isSzInNtl: boolean;
  isBuyOrder: boolean;
  midPx: number;
  maxTradeSz: number;
}) => {
  const { isBuyOrder, isSpot, isSzInNtl, midPx, maxTradeSz } = params;

  if (isSpot) {
    if (isBuyOrder) {
      return isSzInNtl ? maxTradeSz : maxTradeSz / midPx;
    }
    return isSzInNtl ? maxTradeSz * midPx : maxTradeSz;
  }

  return isSzInNtl ? maxTradeSz * midPx : maxTradeSz;
};

/**
 * Calculates the order value in USD.
 * If isSzInNtl is true, multiply the orderSize times the price or limit price (in notional).
 * Otherwise, divide the orderSize by the price or limit price (in notional) and then multiply by mid price to get the notional value.
 *
 * @param params - The parameters for calculating the order value.
 * @param params.orderSize - The size of the order.
 * @param params.szDecimals - The number of decimals of the asset size.
 * @param params.referencePx - The reference price of the asset.
 * @param params.limitPx - The limit price of the order.
 * @param params.orderType - The type of the order.
 * @param params.isSzInNtl - Whether the order size is in notional.
 * @returns The order value in USD.
 */
export const calculateOrderValue = (params: {
  orderSize: number;
  referencePx: number;
  szDecimals: number;
  limitPx?: number;
  orderType: OrderType;
  isSzInNtl: boolean;
}) => {
  const price =
    (isLimitOrder(params.orderType) ? params.limitPx : params.referencePx) ?? 1;

  if (params.isSzInNtl) {
    return (
      roundToDecimals(params.orderSize / price, params.szDecimals, "floor") *
      params.referencePx
    );
  }

  return params.orderSize * price;
};
