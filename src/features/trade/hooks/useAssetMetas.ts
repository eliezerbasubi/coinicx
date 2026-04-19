import { useCallback } from "react";
import { useSuspenseQueries } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";
import { AssetMeta, InstrumentType } from "@/lib/types/trade";
import {
  mapDataToPerpsMetas,
  mapDataToSpotMetas,
  mapPerpDataToAssetMeta,
  mapSpotDataToAssetMeta,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

export const useAssetMetas = () => {
  const { data, error, loading } = useSuspenseQueries({
    combine(result) {
      return {
        data: {
          perpMetas: result[0]?.data,
          ...result[1]?.data,
        },
        error: result[0]?.error || result[1]?.error,
        loading: result[0]?.isLoading || result[1]?.isLoading,
      };
    },
    queries: [
      {
        queryKey: [QUERY_KEYS.allPerpMetas],
        staleTime: Infinity,
        queryFn: () => hlInfoClient.allPerpMetas(),
        select: mapDataToPerpsMetas,
      },
      {
        queryKey: [QUERY_KEYS.spotMeta],
        staleTime: Infinity,
        queryFn: () => hlInfoClient.spotMeta(),
        select: mapDataToSpotMetas,
      },
    ],
  });

  const getTokenMeta = useCallback(
    (
      instrumentType: InstrumentType,
      baseAsset: string,
      quoteAsset: string,
    ): (AssetMeta & { universeIndex?: number }) | undefined => {
      if (instrumentType === "spot") {
        if (
          !baseAsset ||
          !quoteAsset ||
          !data.tokenNamesToUniverseIndex?.size ||
          !data.spotMeta
        )
          return;

        const universeIndex = data.tokenNamesToUniverseIndex
          ?.get(baseAsset)
          ?.get(quoteAsset);

        if (!universeIndex) return;

        const universe = data.spotMeta.universe[universeIndex];

        if (!universe) return;

        const baseTokenMeta = data.spotMeta.tokens[universe.tokens[0]];
        const quoteTokenMeta = data.spotMeta.tokens[universe.tokens[1]];

        if (!baseTokenMeta || !quoteTokenMeta) return;

        const meta = mapSpotDataToAssetMeta(
          universe,
          baseTokenMeta,
          quoteTokenMeta.name,
        );

        return {
          ...meta,
          universeIndex,
        };
      }

      // Handle perps meta
      const perpDexsAndMeta = data.perpMetas;
      if (!perpDexsAndMeta?.length) return;

      const { dex, base } = parseBuilderDeployedAsset(baseAsset);
      const perpDexState = perpDexsAndMeta.find((meta) => meta.dex === dex);

      if (perpDexState) {
        const index = perpDexState.universe.findIndex(
          (meta) => meta.name.toLowerCase() === baseAsset.toLowerCase(),
        );

        const universe = perpDexState.universe[index];

        if (universe) {
          const quote =
            data.spotMeta?.tokens[perpDexState.collateralToken].name;

          return mapPerpDataToAssetMeta({
            universe,
            quote,
            index,
            dex,
            base,
            perpDexIndex: perpDexState.perpDexIndex,
          });
        }
      }
    },
    [data.perpMetas, data.spotMeta],
  );

  return {
    ...data,
    error,
    isLoading: loading,
    getTokenMeta,
  };
};
