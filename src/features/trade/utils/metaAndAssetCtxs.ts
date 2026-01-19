import {
  AllPerpMetasResponse,
  MarginTableResponse,
  SpotMetaResponse,
} from "@nktkas/hyperliquid";

import { AssetMeta } from "@/types/trade";

import { MAX_PERPS_DECIMALS, MAX_SPOT_DECIMALS } from "../constants";
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
    szDecimals: MAX_SPOT_DECIMALS - token.szDecimals,
    weiDecimals: token.weiDecimals,
    coin: universe.name,
    isCanonical: universe.isCanonical,
    maxLeverage: 0,
    quote,
    dex: null,
    symbol: token.name + "/" + quote,
  };
};

export const mapPerpDataToAssetMeta = (data: {
  universe: AllPerpMetasResponse[number]["universe"][number];
  quote?: string;
  perpDexIndex?: number;
  dex: string;
  base: string;
  index: number;
  marginTable?: MarginTableResponse;
}): AssetMeta => {
  const { universe, dex, base, index } = data;

  const quote = parseQuoteAsset(data.quote);

  return {
    index,
    assetId:
      data.perpDexIndex !== undefined
        ? 100000 + data.perpDexIndex * 10000 + index
        : null,
    marginTable: data.marginTable,
    base,
    coin: universe.name,
    quote,
    symbol: base + "-" + quote,
    dex,
    maxLeverage: universe.maxLeverage,
    isDelisted: universe.isDelisted,
    onlyIsolated: universe.onlyIsolated,
    marginMode: universe.marginMode,
    szDecimals: MAX_PERPS_DECIMALS - universe.szDecimals,
    tokenId: null,
  };
};
