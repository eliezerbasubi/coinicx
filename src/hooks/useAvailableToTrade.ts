import { useMemo } from "react";

import {
  getAvailableToTrade,
  getMaxTradeSize,
  useShallowUserTradeStore,
} from "@/lib/store/trade/user-trade";

type UseAvailableToTradeParams = {
  isBuyOrder: boolean;
  spotAsset?: { base: string; quote: string };
};

export const useMaxTradeSz = (params: UseAvailableToTradeParams) => {
  const { maxTradeSzs, spotBalances } = useShallowUserTradeStore((s) => ({
    maxTradeSzs: s.activeAssetData?.maxTradeSzs,
    spotBalances: s.spotBalances,
  }));

  return useMemo(
    () =>
      getMaxTradeSize({
        isBuyOrder: params.isBuyOrder,
        spotBalances,
        maxTradeSzs: maxTradeSzs ?? ["0", "0"],
        spotAsset: params.spotAsset,
      }),
    [params.isBuyOrder, spotBalances, maxTradeSzs, params.spotAsset],
  );
};

/**
 * A hook to get the available balance to trade on an asset.
 *
 * If the asset is a perp, it will return the available balance for the active asset.
 * If the asset is a spot, it will return the available balance for the spot asset.
 *
 * @param isBuyOrder Whether the order is a buy order
 * @param spotAsset Optional spot asset to get the available balance for
 * @returns quote balance if isSpot and buying and base balance for perps if buying
 */
export const useAvailableToTrade = (params: UseAvailableToTradeParams) => {
  const { activeAssetData, spotBalances } = useShallowUserTradeStore((s) => ({
    activeAssetData: s.activeAssetData?.availableToTrade,
    spotBalances: s.spotBalances,
  }));

  return useMemo(
    () =>
      getAvailableToTrade({
        isBuyOrder: params.isBuyOrder,
        spotBalances,
        perpsAvailableToTrade: activeAssetData ?? ["0", "0"],
        spotAsset: params.spotAsset,
      }),
    [params.isBuyOrder, params.spotAsset, activeAssetData, spotBalances],
  );
};
