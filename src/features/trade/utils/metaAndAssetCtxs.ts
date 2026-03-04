import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
  AllPerpMetasResponse,
  SpotMetaResponse,
} from "@nktkas/hyperliquid";

import { AssetCxt, AssetMeta } from "@/types/trade";

import { formatSymbol } from "./formatting";
import { parseQuoteAsset } from "./perps";

export const mapSpotDataToAssetMeta = (
  universe: SpotMetaResponse["universe"][number],
  token: SpotMetaResponse["tokens"][number],
  quote: string,
): AssetMeta => {
  return {
    assetId: 10000 + universe.index,
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
    assetId: buildPerpAssetId({
      perpDexIndex: data.perpDexIndex,
      universeIndex: index,
    }),
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

export const mapDataToAssetCtx = (
  data: ActiveSpotAssetCtxWsEvent["ctx"] | ActiveAssetCtxWsEvent["ctx"],
) => {
  const markPx = Number(data.markPx);

  const ctx: AssetCxt = {
    markPx,
    midPx: Number(data.midPx),
    prevDayPx: Number(data.prevDayPx),
    dayBaseVlm: Number(data.dayBaseVlm),
    dayNtlVlm: Number(data.dayNtlVlm),
    referencePx: markPx,
    openInterest: null,
    funding: null,
    oraclePx: null,
    marketCap: null,
  };

  if ("openInterest" in data) {
    ctx.openInterest = Number(data.openInterest);
    ctx.funding = Number(data.funding);
    ctx.oraclePx = Number(data.oraclePx);
  } else {
    ctx.marketCap = Number(data.circulatingSupply) * markPx;
    ctx.referencePx = Number(data.midPx);
  }

  return ctx;
};

export const buildPerpAssetId = ({
  perpDexIndex,
  universeIndex,
}: {
  perpDexIndex: number;
  universeIndex: number;
}) => {
  return perpDexIndex
    ? 100000 + perpDexIndex * 10000 + universeIndex
    : universeIndex;
};
