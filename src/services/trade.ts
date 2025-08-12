import { OrderBookData } from "@/types/orderbook";
import { Kline, TradeMarketTicker } from "@/types/trade";

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

export const getProductBySymbol = async (
  symbol: string,
): Promise<TradeMarketTicker> => {
  const response = await fetch(
    `https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-product-by-symbol?symbol=${symbol}`,
  );

  const result = await response.json();

  const data = result.data;

  return {
    an: data.an,
    qn: data.qn,
    o: Number(data.o),
    h: Number(data.h),
    l: Number(data.l),
    c: Number(data.c),
    v: Number(data.v),
    qv: Number(data.qv),
    as: data.as,
    cs: data.cs,
  };
};

export const getTokenInfo = async (symbol: string) => {
  const response = await fetch(
    `https://www.binance.com/bapi/apex/v1/friendly/apex/marketing/web/token-info?symbol=${symbol}`,
  );

  const result = await response.json();

  return result;
};
