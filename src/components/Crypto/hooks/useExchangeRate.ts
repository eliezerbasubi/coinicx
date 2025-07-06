import { useQueryClient } from "@tanstack/react-query";

import { IExchangeRate } from "@/types/market";
import { QUERY_KEYS } from "@/constants/queryKeys";

type UseExchangeRateArgs = {
  baseCurrency: string;
  quoteCurrency: string;
};

/**
 * A hook to compute the exchange rate between two currencies using cached rates.
 *
 * This hook retrieves the latest exchange rates from the cache (populated by the `getExchangeRates` service),
 * and calculates the rate for converting a base currency to a quote currency. The calculation uses the base currency as the
 * denominator and the quote currency as the numerator, following the convention that BTC is the denominator currency.
 *
 * If the requested currencies are not found in the cache, it falls back to using BTC for the base and USD for the quote.
 *
 * @param {Object} args - The arguments object.
 * @param {string} args.baseCurrency - The asset code of the base currency (denominator) to convert from (e.g., 'BTC', 'ETH').
 * @param {string} args.quoteCurrency - The asset code of the quote currency (numerator) to convert to (e.g., 'USD', 'NGN').
 *
 * @returns {{
 *   exchangeRate: IExchangeRate | undefined,
 *   computeExchangeRate: (args: UseExchangeRateArgs) => IExchangeRate | undefined
 * }} An object containing:
 *   - exchangeRate: The computed exchange rate object for the quote currency, with the `value` property representing
 *     the rate for converting one unit of the base currency to the quote currency. Returns `undefined` if rates are not available.
 *   - computeExchangeRate: A function to manually compute the exchange rate for any given pair of currencies using the cached data.
 *
 * @example
 * const { exchangeRate } = useExchangeRate({ baseCurrency: 'ETH', quoteCurrency: 'USD' });
 * // exchangeRate.value gives the price of 1 ETH in USD
 */
export const useExchangeRate = (
  args?: UseExchangeRateArgs,
): {
  exchangeRate: IExchangeRate | undefined;
  computeExchangeRate: (args: UseExchangeRateArgs) => IExchangeRate | undefined;
} => {
  const queryClient = useQueryClient();

  const exchangeRates = queryClient.getQueryData<Record<string, IExchangeRate>>(
    [QUERY_KEYS.exchangeRates],
  );

  const computeExchangeRate = (args: UseExchangeRateArgs) => {
    if (!exchangeRates) return;

    const baseExchange =
      exchangeRates[args.baseCurrency.toLowerCase()] ?? exchangeRates["btc"];
    const quoteExchange =
      exchangeRates[args.quoteCurrency.toLowerCase()] ?? exchangeRates["usd"];

    if (baseExchange.unit.toLowerCase() === "btc") return quoteExchange;

    return {
      ...quoteExchange,
      value: quoteExchange.value / baseExchange.value,
    };
  };

  return {
    exchangeRate: args ? computeExchangeRate(args) : undefined,
    computeExchangeRate,
  };
};
