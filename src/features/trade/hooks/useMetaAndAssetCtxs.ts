import { useCallback } from "react";
import { AllPerpMetasResponse } from "@nktkas/hyperliquid";
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
          perpDexs: result[2]?.data,
        },
        error: result[0]?.error || result[1]?.error || result[2]?.error,
        loading:
          result[0]?.isLoading || result[1]?.isLoading || result[2]?.isLoading,
      };
    },
    queries: [
      {
        queryKey: [QUERY_KEYS.allPerpMetas],
        staleTime: Infinity,
        queryFn: () => hlInfoClient.allPerpMetas(),
      },
      {
        queryKey: [QUERY_KEYS.spotMeta],
        staleTime: Infinity,
        queryFn: () => hlInfoClient.spotMeta(),
      },
      {
        queryKey: [QUERY_KEYS.perpDexs],
        staleTime: Infinity,
        queryFn: () => hlInfoClient.perpDexs(),
      },
    ],
  });

  const getAllPerpDexsAndMetas = useCallback(() => {
    const dexs = new Map<
      string,
      {
        name: string;
        fullName?: string;
        index: number;
        meta: AllPerpMetasResponse[number];
      }
    >();

    if (data.perpDexs?.length && data.perpMetas?.length) {
      data.perpDexs.forEach((dex, index) => {
        const name = dex ? dex.name : "";

        const meta = data.perpMetas?.[index];

        if (meta) {
          dexs.set(name, { name, index, fullName: dex?.fullName, meta });
        }
      });
    }

    return dexs;
  }, [data.perpDexs, data.perpMetas]);

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

  /**
   * Map spot assets to a coin from universe's name
   */
  const getAllSpotAssetsMetas = useCallback(() => {
    if (!data.spotMeta) return;

    const allAssetsMetas = new Map<string, AssetMeta>();

    for (const universe of data.spotMeta.universe) {
      const [baseIndex, quoteIndex] = universe.tokens;

      const baseTokenMeta = data.spotMeta.tokens[baseIndex];
      const quoteTokenMeta = data.spotMeta.tokens[quoteIndex];

      allAssetsMetas.set(
        universe.name,
        mapSpotDataToAssetMeta(universe, baseTokenMeta, quoteTokenMeta.name),
      );
    }

    return allAssetsMetas;
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
      const perpDexsAndMeta = getAllPerpDexsAndMetas();
      if (!perpDexsAndMeta.size) return;

      const { dex, base } = parseBuilderDeployedAsset(baseAsset);
      const perpDex = perpDexsAndMeta.get(dex);

      if (perpDex) {
        const universeIndex = perpDex.meta.universe.findIndex(
          (meta) => meta.name.toLowerCase() === baseAsset.toLowerCase(),
        );

        const universe = perpDex.meta.universe[universeIndex];

        if (universe) {
          const quote =
            data.spotMeta?.tokens[perpDex.meta.collateralToken].name;

          return mapPerpDataToAssetMeta({
            universe,
            quote,
            index: universeIndex,
            dex,
            base,
            perpDexIndex: perpDex.index,
          });
        }
      }
    },
    [data],
  );

  return {
    data,
    error,
    isLoading: loading,
    getTokenMeta,
    getAllPerpDexsAndMetas,
    getAllSpotAssetsMetas,
    getSpotInstrumentQuotes,
  };
};
