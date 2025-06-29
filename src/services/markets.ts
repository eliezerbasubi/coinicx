import { ICurrency, IQuote } from "@/types/market";

export const getFiatCurrencies = async (): Promise<ICurrency[]> => {
  const response = await fetch(
    "https://www.binance.com/bapi/asset/v1/public/asset-service/product/currency",
  );

  const result = await response.json();

  return result.data;
};

export const getCryptoCurrencies = async (): Promise<ICurrency[]> => {
  const data = await Promise.resolve(
    require("@/lib/mocks/crypotcurrencies.json"),
  );

  return data.data.map((datum: any) => ({
    pair: datum.assetCode,
    rate: 0,
    symbol: datum.assetCode,
    fullName: datum.assetCode,
    imageUrl: datum.logoUrl,
  }));
};

export const getQuotes = async (): Promise<IQuote[]> => {
  const response = await fetch(
    "https://www.binance.com/bapi/composite/v1/public/promo/cmc/cryptocurrency/quotes/historical?id=1&time_start=1750757439&interval=5m&count=288",
  );

  const result = await response.json();

  return result.data.body.data.quotes;
};

export const getQuote = async (symbol: string): Promise<IQuote[]> => {
  const response = await fetch(
    "https://www.binance.com/bapi/composite/v1/public/promo/cmc/cryptocurrency/quotes/latest?symbol=" +
      symbol,
  );

  const result = await response.json();

  return result.data.body.data.quotes;
};
