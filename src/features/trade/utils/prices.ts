import {
  DEFAULT_ORDER_MAX_SLIPPAGE,
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

  const minDecimals = Math.min(szDecimals, maxSzDecimals - szDecimals);

  const scale = MAX_SIGNIFICANT_DECIMALS - Math.floor(Math.log10(px)) - 1;

  return Math.max(0, Math.min(scale, maxSzDecimals - minDecimals));
};

export const getPriceSigFigs = (
  price: number,
  szDecimals: number,
  isSpot: boolean,
) => {
  const px = Math.abs(price);
  const maxSzDecimals = getMaxSizeDecimals(isSpot);

  const minDecimals = Math.min(szDecimals, maxSzDecimals - szDecimals);

  return Math.max(
    2,
    Math.min(
      MAX_SIGNIFICANT_DECIMALS,
      maxSzDecimals - minDecimals + Math.floor(Math.log10(px)) + 1,
    ),
  );
};

export const parseOrderPrice = (entryPrice: number, decimals: number) => {
  return entryPrice.toFixed(decimals).replace(/\.?0+$/, "");
};

export const parseOrderPriceWithSlippage = (data: {
  entryPrice: number;
  decimals: number;
  isLong: boolean;
  slippage?: number;
}) => {
  const slippage = data.slippage ?? DEFAULT_ORDER_MAX_SLIPPAGE;
  const slippageAmount = data.isLong ? 1 + slippage : 1 - slippage;
  const priceWithSlippage = data.entryPrice * slippageAmount;

  return parseOrderPrice(priceWithSlippage, data.decimals);
};
