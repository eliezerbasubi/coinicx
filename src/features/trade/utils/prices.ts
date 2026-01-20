import {
  MAX_PERPS_DECIMALS,
  MAX_SIGNIFICANT_DECIMALS,
  MAX_SPOT_DECIMALS,
} from "../constants";

export const getMaxSizeDecimals = (isSpot: boolean) => {
  return isSpot ? MAX_SPOT_DECIMALS : MAX_PERPS_DECIMALS;
};

export const getPriceDecimals = (
  price: number,
  szDecimals: number,
  isSpot: boolean,
) => {
  const px = Math.abs(price);
  const maxSzDecimals = getMaxSizeDecimals(isSpot);
  const scale = MAX_SIGNIFICANT_DECIMALS - Math.floor(Math.log10(px)) - 1;
  return Math.max(0, Math.min(scale, maxSzDecimals - szDecimals));
};

export const getPriceSigFigs = (
  price: number,
  szDecimals: number,
  isSpot: boolean,
) => {
  const px = Math.abs(price);
  const maxSzDecimals = getMaxSizeDecimals(isSpot);

  return Math.max(
    2,
    Math.min(
      MAX_SIGNIFICANT_DECIMALS,
      maxSzDecimals - szDecimals + Math.floor(Math.log10(px)) + 1,
    ),
  );
};
