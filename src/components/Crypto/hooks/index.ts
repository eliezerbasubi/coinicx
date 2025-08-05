import { useParams } from "next/navigation";
import { useQueries } from "@tanstack/react-query";

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
