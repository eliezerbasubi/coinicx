import { COINICX_BUILDER_SETTINGS } from "@/lib/constants/trade";

/**
 * Get the builder wallet and fee for spot and perps given the asset id
 */
export const getBuilder = (assetId: number) => {
  // Spot Ids start at 10_000
  const isSpot = assetId > 10_000;

  const fee = isSpot
    ? COINICX_BUILDER_SETTINGS.spot
    : COINICX_BUILDER_SETTINGS.perps;
  return {
    b: COINICX_BUILDER_SETTINGS.b,
    f: fee,
  };
};
