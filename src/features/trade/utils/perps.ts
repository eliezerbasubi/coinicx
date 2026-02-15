import { OrderBook } from "@/types/orderbook";
import { OrderType } from "@/types/trade";

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
  midPx: number;
  limitPx?: number;
  orderType: OrderType;
}) => {
  if (isLimitOrder(params.orderType)) {
    return params.orderSize * (params.limitPx ?? 0);
  }
  // TODO: Implement order value calculation for scale orders here

  return params.orderSize * (params.midPx ?? 0);
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
