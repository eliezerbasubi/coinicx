import { AllPerpMetasResponse, SpotMetaResponse } from "@nktkas/hyperliquid";

import { AssetMeta } from "@/types/trade";

import { formatSymbol } from "./formatting";
import { parseQuoteAsset } from "./perps";

export const mapSpotDataToAssetMeta = (
  universe: SpotMetaResponse["universe"][number],
  token: SpotMetaResponse["tokens"][number],
  quote: string,
): AssetMeta => {
  return {
    assetId: 10000 + token.index,
    tokenId: token.tokenId,
    index: token.index,
    base: token.name,
    fullName: token.fullName,
    szDecimals: token.szDecimals,
    coin: universe.name,
    isCanonical: universe.isCanonical,
    maxLeverage: 0,
    quote,
    dex: null,
    symbol: formatSymbol(token.name, quote, true),
  };
};

export const mapPerpDataToAssetMeta = (data: {
  universe: AllPerpMetasResponse[number]["universe"][number];
  quote?: string;
  perpDexIndex: number;
  dex: string;
  base: string;
  index: number;
}): AssetMeta => {
  const { universe, dex, base, index } = data;

  const quote = parseQuoteAsset(data.quote);

  return {
    index,
    assetId: data.perpDexIndex
      ? 100000 + data.perpDexIndex * 10000 + index
      : index,
    base,
    coin: universe.name,
    quote,
    symbol: formatSymbol(base, quote, false),
    dex,
    perpDexIndex: data.perpDexIndex,
    maxLeverage: universe.maxLeverage,
    isDelisted: universe.isDelisted,
    onlyIsolated: universe.onlyIsolated,
    marginMode: universe.marginMode,
    szDecimals: universe.szDecimals,
    tokenId: null,
  };
};
