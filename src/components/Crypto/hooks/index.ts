import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQueries, useQueryClient } from "@tanstack/react-query";

import { ICryptoCurrency, IExchangeRate } from "@/types/market";
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

export const useCurrentCryptoCurrency = () => {
  const assetId = useCryptoMarketContext((s) => s.selectedAssets?.crypto.id);

  const queryClient = useQueryClient();

  const cryptoList = queryClient.getQueryData<ICryptoCurrency[]>([
    QUERY_KEYS.cryptoList,
  ]);

  return useMemo(
    () => cryptoList?.find((item) => item.id === assetId),
    [assetId],
  );
};

/**
 * A hook to convert to get a rate between a pair.
 * The BTC is the denominator currency
 * @param baseCurrency
 * @param quoteCurrency
 * @returns the quote exchange rate
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

  const denominatorRate = exchangeRates["btc"].value;
  const baseRate = exchangeRates[args.baseCurrency.toLowerCase()]?.value;
  const quoteExchange =
    exchangeRates[args.quoteCurrency.toLowerCase()] ?? exchangeRates["usd"];

  const value = denominatorRate * baseRate * quoteExchange.value;

  return { ...quoteExchange, value };
};
