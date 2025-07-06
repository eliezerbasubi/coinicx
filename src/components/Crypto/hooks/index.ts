import { useParams } from "next/navigation";
import { useQueries, useQueryClient } from "@tanstack/react-query";

import { IExchangeRate } from "@/types/market";
import { getCryptoPathParams } from "@/components/Crypto/utils/getCryptoPathParams";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getCryptoCurrencies, getExchangeRates } from "@/services/markets";
import { useCryptoMarketContext } from "@/store/markets/hook";

export const useFetchData = () => {
  const result = useQueries({
    queries: [
      {
        queryKey: [QUERY_KEYS.cryptoList],
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        queryFn: getCryptoCurrencies,
      },
      {
        queryKey: [QUERY_KEYS.exchangeRates],
        staleTime: 5 * 60 * 1000, // Following CoinGecko Note: Cache / Update Frequency: every 5 minutes for all the API plans.
        queryFn: getExchangeRates,
      },
    ],
  });
  return result;
};

export const useCurrentAssets = () => {
  const { slug } = useParams<{ slug: string[] }>();

  const selectedAssets = useCryptoMarketContext((s) => s.selectedAssets);

  const { fiat, crypto } = getCryptoPathParams(slug);

  const fiatAssetCode = (selectedAssets?.fiat.assetCode || fiat).toUpperCase();
  const cryptoAssetCode = (
    selectedAssets?.crypto?.assetCode || crypto
  ).toUpperCase();

  return { fiatAssetCode, cryptoAssetCode, selectedAssets };
};

/**
 * A hook to compute the exchange rate between two currencies using cached exchange rates.
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
 * @returns {IExchangeRate | undefined} The exchange rate object for the quote currency, with the `value` property representing
 *          the computed rate for converting one unit of the base currency to the quote currency. Returns `undefined` if rates are not available.
 *
 * @example
 * const rate = useExchangeRate({ baseCurrency: 'ETH', quoteCurrency: 'USD' });
 * // rate.value gives the price of 1 ETH in USD
 */
export const useExchangeRate = (args: {
  baseCurrency: string;
  quoteCurrency: string;
}): IExchangeRate | undefined => {
  const queryClient = useQueryClient();

  const exchangeRates = queryClient.getQueryData<Record<string, IExchangeRate>>(
    [QUERY_KEYS.exchangeRates],
  );

  if (!exchangeRates) return;

  const baseRate =
    exchangeRates[args.baseCurrency.toLowerCase()] ?? exchangeRates["btc"];
  const quoteExchange =
    exchangeRates[args.quoteCurrency.toLowerCase()] ?? exchangeRates["usd"];

  if (baseRate.unit.toLowerCase() === "btc") return quoteExchange;

  const value = baseRate.value / quoteExchange.value;

  return { ...quoteExchange, value };
};

export const useSelectedAssetsRate = () => {
  const { fiatAssetCode, cryptoAssetCode } = useCurrentAssets();

  const rate = useExchangeRate({
    baseCurrency: cryptoAssetCode,
    quoteCurrency: fiatAssetCode,
  });

  return { rate, fiatAssetCode };
};
