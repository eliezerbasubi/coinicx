import { useCallback } from "react";
import { useQueries } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";
import { AssetMeta, InstrumentType, SpotMetas } from "@/lib/types/trade";
import {
  mapDataToSpotMetas,
  mapPerpDataToAssetMeta,
  mapSpotDataToAssetMeta,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

export const useMetaAndAssetCtxs = () => {
  const { data, error, loading } = useQueries({
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
        queryFn: async () => {
          const data = await hlInfoClient.allPerpMetas();

          const metas = [];

          for (let index = 0; index < data.length; index++) {
            const meta = data[index];
            const { dex } = parseBuilderDeployedAsset(meta.universe[0].name);

            metas.push({
              ...meta,
              perpDexIndex: index,
              dex,
            });
          }
          return metas;
        },
      },
      {
        queryKey: [QUERY_KEYS.spotMeta],
        staleTime: Infinity,
        queryFn: async (): Promise<SpotMetas> => {
          const spotMeta = await hlInfoClient.spotMeta();

          return mapDataToSpotMetas(spotMeta);
        },
      },
    ],
  });

  const getTokenMeta = useCallback(
    (
      instrumentType: InstrumentType,
      baseAsset: string,
      quoteAsset: string,
    ): AssetMeta | undefined => {
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

        return mapSpotDataToAssetMeta(
          universe,
          baseTokenMeta,
          quoteTokenMeta.name,
        );
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
