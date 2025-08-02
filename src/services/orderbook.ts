import { OrderBookData } from "@/types/orderbook";

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
