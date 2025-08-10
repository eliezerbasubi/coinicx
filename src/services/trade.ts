import { OrderBookData } from "@/types/orderbook";
import { Kline } from "@/types/trade";

export const getOrderBookDepth = async (params: {
  symbol: string;
  limit?: number;
}): Promise<OrderBookData> => {
  const response = await fetch(
    `https://www.binance.com/api/v3/depth?symbol=${params.symbol}&limit=${params.limit ?? 1000}`,
  );

  const result = await response.json();

  return result;
};

export const getKlines = async (params: {
  symbol: string;
  interval?: string;
  limit?: number;
}): Promise<Kline[]> => {
  const response = await fetch(
    `https://www.binance.com/api/v3/uiKlines?symbol=${params.symbol}&interval=${params.interval}&limit=${params.limit ?? 1000}`,
  );

  const result = await response.json();

  return result;
};
