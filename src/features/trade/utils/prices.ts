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

export const roundToDecimals = (
  entryPrice: number,
  decimals: number,
  roundingMode: "round" | "floor" | "ceil" = "round",
) => {
  const factor = Math.pow(10, decimals);

  const value = entryPrice * factor;

  switch (roundingMode) {
    case "round":
      return Math.round(value) / factor;
    case "floor":
      return Math.floor(value + 1e-9) / factor;
    case "ceil":
      return Math.ceil(value - 1e-9) / factor;
  }
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

  return roundToDecimals(priceWithSlippage, params.decimals, "floor");
};
