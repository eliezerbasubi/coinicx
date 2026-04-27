import { useMemo } from "react";
import { NotifyOnChangeProps, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";
import { mapDataToSpotMetas } from "@/features/trade/utils";

type UseSpotMetasArgs = {
  enabled?: boolean;
  notifyOnChangeProps?: NotifyOnChangeProps;
};

export const useSpotMetas = (args?: UseSpotMetasArgs) => {
  const { data: spotMetas } = useQuery({
    queryKey: QUERY_KEYS.spotMeta,
    staleTime: Infinity,
    notifyOnChangeProps: args?.notifyOnChangeProps,
    enabled: args?.enabled,
    select: mapDataToSpotMetas,
    queryFn: () => hlInfoClient.spotMeta(),
  });

  return spotMetas;
};

/**
 * Get the universe and meta for a given asset name.
 *
 * @param assetName The name of the asset to get the universe and meta for. e.g. HYPE or BTC
 * @returns The universe and meta for the given asset name.
 */
export const useSpotAssetMeta = (args: { assetName: string | null }) => {
  const { assetName } = args;

  const spotMetas = useSpotMetas({
    enabled: !!assetName,
  });

  const assetMeta = useMemo(() => {
    if (!spotMetas || !assetName) return null;

    const universeIndex = spotMetas.tokenNamesToUniverseIndex
      ?.get(assetName)
      ?.get("USDC"); // USDH and USDC are both stablecoins, so we use USDC as the quote asset

    if (!universeIndex) return null;

    const universe = spotMetas.spotMeta.universe[universeIndex];

    if (!universe) return null;

    const baseTokenMeta = spotMetas.spotMeta.tokens[universe.tokens[0]];

    if (!baseTokenMeta) return null;

    return {
      universe,
      meta: baseTokenMeta,
    };
  }, [spotMetas, assetName]);

  return assetMeta;
};
