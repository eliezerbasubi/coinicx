import { ICryptoCurrency, IExchangeRate } from "@/lib/types/market";

export const getCryptoCurrencies = async (): Promise<ICryptoCurrency[]> => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
  );

  const result = await res.json();

  return result;
};

export const getQuotes = async (
  id: string,
  params: { from: number; to: number; vs_currency: string },
): Promise<Array<[number, number]>> => {
  const queryString = new URLSearchParams(
    params as unknown as Record<string, string>,
  );

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?${queryString}`,
  );

  const result = await response.json();

  return result.prices;
};

export const getExchangeRates = async (): Promise<
  Record<string, IExchangeRate>
> => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/exchange_rates",
  );

  const result = await response.json();

  return result.rates;
};
