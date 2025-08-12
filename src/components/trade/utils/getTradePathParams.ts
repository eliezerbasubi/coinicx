import { TradeType } from "@/types/trade";

import { defaultSpotAsset, TRADE_TYPES } from "../constants";

export const getTradePathParams = (slug?: string[]) => {
  const slugs = slug ?? [];

  const [tradeType, ...assets] = slugs;

  const [baseAsset, quoteAsset] = assets;

  const type = TRADE_TYPES.find((type) => type.value === tradeType);

  if (!type) {
    return { ...defaultSpotAsset, type: "spot" as TradeType, redirect: true };
  }

  if (assets.length > 2 || !baseAsset || !quoteAsset) {
    return { ...defaultSpotAsset, type: type.value, redirect: true };
  }

  return {
    type: type.value,
    baseAsset,
    quoteAsset,
    redirect: false,
  };
};
