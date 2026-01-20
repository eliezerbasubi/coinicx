export type OrderBookType = "bids" | "asks";

export type AmountPriceLevel = { px: string; sz: string };
export type CumulativePriceLevel = AmountPriceLevel & { total: number };
export type PriceLevel = AmountPriceLevel | CumulativePriceLevel;
export type OrderBookLayout = "orderBook" | "buyOrder" | "sellOrder";

export type OrderBookData = Record<OrderBookType, PriceLevel[]>;

export interface IOrderBookSettings {
  averageAndSum: boolean;
  showBuyAndSellRatio: boolean;
  rounding: boolean;
  depthVisualizer: "amount" | "cumulative";
}

export type Tick = {
  value: number;
  label: string;
};
