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
  const multiplier = Math.pow(10, decimals);
  const epsilon = 0;

  return Math.round(entryPrice * multiplier + epsilon) / multiplier;
};

export const calculateSlippageAdjustedPrice = (params: {
  entryPrice: number;
  isBuyOrder: boolean;
  slippage?: number;
}) => {
  const slippage = params.slippage ?? DEFAULT_ORDER_MAX_SLIPPAGE;
  const slippageAmount = params.isBuyOrder ? 1 + slippage : 1 - slippage;

  return params.entryPrice * slippageAmount;
};

export const parseOrderPriceWithSlippage = (params: {
  entryPrice: number;
  decimals: number;
  isBuyOrder: boolean;
  slippage?: number;
}) => {
  const priceWithSlippage = calculateSlippageAdjustedPrice({
    entryPrice: params.entryPrice,
    isBuyOrder: params.isBuyOrder,
    slippage: params.slippage,
  });

  return parseOrderPrice(priceWithSlippage, params.decimals);
};
