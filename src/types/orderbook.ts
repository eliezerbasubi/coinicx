export type OrderBookType = "bids" | "asks";

export type PriceLevel = [string, string]; // [price, quantity]
export type OrderBookLayout = "orderBook" | "buyOrder" | "sellOrder";

interface ILastUpdateId {
  lastUpdateId: number;
}

export type OrderBookData = Record<OrderBookType, PriceLevel[]> & ILastUpdateId;

export type DepthUpdate = {
  u: number;
  U: number;
  s: string;
  e: string;
  a: PriceLevel[];
  b: PriceLevel[];
};
