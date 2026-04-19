import { useMemo } from "react";

import {
  getAvailableToTrade,
  useShallowUserTradeStore,
} from "@/lib/store/trade/user-trade";

export const useMaxTradeSz = (isBuyOrder: boolean) => {
  const maxTradeSizes = useShallowUserTradeStore(
    (s) => s.activeAssetData?.maxTradeSzs,
  );

  const [maxBaseTradeSz, maxQuoteTradeSz] = maxTradeSizes ?? ["0", "0"];

  return isBuyOrder ? Number(maxQuoteTradeSz) : Number(maxBaseTradeSz);
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
export const useAvailableToTrade = (params: {
  isBuyOrder: boolean;
  spotAsset?: { base: string; quote: string };
}) => {
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
