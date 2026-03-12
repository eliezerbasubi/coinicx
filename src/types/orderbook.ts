export type OrderBookType = "bids" | "asks";

export type AmountPriceLevel = { px: string; sz: string };
export type CumulativePriceLevel = AmountPriceLevel & { total: number };
export type PriceLevel = AmountPriceLevel | CumulativePriceLevel;
export type OrderBookLayout = "orderBook" | "buyOrder" | "sellOrder";

export type OrderBook = Record<OrderBookType, PriceLevel[]>;

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

/**
 * Direction in which the order book is display (top-bottom or left-right)
 * `vertical` means asks are read from lowest to highest and `horizontal` means asks are read from highest to lowest
 * */
export type OrderBookDisplayOrientation = "vertical" | "horizontal";
