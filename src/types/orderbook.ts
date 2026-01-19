export type OrderBookType = "bids" | "asks";

export type AmountPriceLevel = { px: string, sz: string };
export type CumulativePriceLevel = AmountPriceLevel & { total: number }
export type PriceLevel = AmountPriceLevel | CumulativePriceLevel;
export type OrderBookLayout = "orderBook" | "buyOrder" | "sellOrder";

interface ILastUpdateId {
  lastUpdateId: number;
}

export type OrderBookData = Record<OrderBookType, PriceLevel[]> & ILastUpdateId;

// export type DepthUpdate = {
//   u: number;
//   U: number;
//   s: string;
//   e: string;
//   a: PriceLevel[];
//   b: PriceLevel[];
// };

export interface IOrderBookSettings {
  averageAndSum: boolean;
  showBuyAndSellRatio: boolean;
  rounding: boolean;
  depthVisualizer: "amount" | "cumulative";
}
