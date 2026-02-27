import { useCallback } from "react";
import { useQueries } from "@tanstack/react-query";

import { AssetMeta, InstrumentType } from "@/types/trade";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  mapPerpDataToAssetMeta,
  mapSpotDataToAssetMeta,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";
import { hlInfoClient } from "@/services/transport";

export const useMetaAndAssetCtxs = () => {
  const { data, error, loading } = useQueries({
    combine(result) {
      return {
        data: {
          perpMetas: result[0]?.data,
          spotMeta: result[1]?.data,
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
        queryFn: () => hlInfoClient.spotMeta(),
      },
    ],
  });

  const getSpotInstrumentQuotes = useCallback(() => {
    const quotes = new Map<
      number,
      { name: string; fullName: string | null; index: number }
    >();

    if (data.spotMeta) {
      data.spotMeta.universe.forEach((universe) => {
        const quoteToken = universe.tokens[1];

        const token = data.spotMeta?.tokens[quoteToken];

        if (token) {
          quotes.set(quoteToken, {
            name: token.name,
            fullName: token.fullName,
            index: token.index,
          });
        }
      });
    }

    return quotes;
  }, [data.spotMeta]);

  const getSpotAssetsData = useCallback(() => {
    const tokensToAssetsMetas = new Map<string, AssetMeta>();
    const tokensToUniverseIndex = new Map<number, Map<number, number>>();

    if (!data.spotMeta)
      return {
        tokensToAssetsMetas,
        tokensToUniverseIndex,
      };

    for (const universe of data.spotMeta.universe) {
      const [baseIndex, quoteIndex] = universe.tokens;

      const baseTokenMeta = data.spotMeta.tokens[baseIndex];
      const quoteTokenMeta = data.spotMeta.tokens[quoteIndex];

      tokensToAssetsMetas.set(
        universe.name,
        mapSpotDataToAssetMeta(universe, baseTokenMeta, quoteTokenMeta.name),
      );

      if (!tokensToUniverseIndex.has(baseIndex)) {
        tokensToUniverseIndex.set(baseIndex, new Map<number, number>());
      }

      tokensToUniverseIndex.get(baseIndex)?.set(quoteIndex, universe.index);
    }

    return { tokensToAssetsMetas, tokensToUniverseIndex };
  }, [data.spotMeta]);

  const getTokenMeta = useCallback(
    (
      instrumentType: InstrumentType,
      baseAsset: string,
      quoteAsset: string,
    ): AssetMeta | undefined => {
      if (instrumentType === "spot") {
        if (!baseAsset || !quoteAsset || !data.spotMeta) return;

        const universe = data.spotMeta.universe.find((universe) => {
          const [baseIndex, quoteIndex] = universe.tokens;

          return (
            data.spotMeta?.tokens[baseIndex].name.toLowerCase() ===
              baseAsset.toLowerCase() &&
            data.spotMeta?.tokens[quoteIndex].name.toLowerCase() ===
              quoteAsset.toLowerCase()
          );
        });

        if (!universe) return;

        const [baseIndex, quoteIndex] = universe.tokens;

        return mapSpotDataToAssetMeta(
          universe,
          data.spotMeta.tokens[baseIndex],
          data.spotMeta.tokens[quoteIndex].name,
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
    [data],
  );

  return {
    spotMeta: data.spotMeta,
    perpMetas: data.perpMetas,
    error,
    isLoading: loading,
    getTokenMeta,
    getSpotAssetsData,
    getSpotInstrumentQuotes,
  };
};
