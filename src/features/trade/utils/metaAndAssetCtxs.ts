import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
  AllPerpMetasResponse,
  SpotMetaResponse,
} from "@nktkas/hyperliquid";

import { AssetCxt, AssetMeta, SpotMetas } from "@/lib/types/trade";

import { formatSymbol } from "./formatting";
import { getTokenDisplayName } from "./getTokenDisplayName";
import { parseBuilderDeployedAsset, parseQuoteAsset } from "./perps";

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
    pxDecimals: null,
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
    pxDecimals: null,
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

export const buildSpotAssetId = (spotId: number) => {
  return 10000 + spotId;
};

export const mapDataToSpotMetas = (data: SpotMetaResponse) => {
  const tokenNamesToUniverseIndex = new Map<string, Map<string, number>>();
  const spotNamesToTokens = new Map() as SpotMetas["spotNamesToTokens"];
  const tokensToSpotId = new Map<number, Map<number, number>>();

  for (let index = 0; index < data.universe.length; index++) {
    const universe = data.universe[index];
    const [baseIndex, quoteIndex] = universe.tokens;

    const baseTokenMeta = data.tokens[baseIndex];
    const quoteTokenMeta = data.tokens[quoteIndex];

    if (!baseTokenMeta || !quoteTokenMeta) continue;

    // Update name in tokens of spotMeta to the display name
    data.tokens[baseIndex].name = getTokenDisplayName(baseTokenMeta.name);
    data.tokens[quoteIndex].name = getTokenDisplayName(quoteTokenMeta.name);

    /** Map spot names to tokens */
    if (!spotNamesToTokens.has(universe.name)) {
      spotNamesToTokens.set(universe.name, {
        baseToken: baseIndex,
        quoteToken: quoteIndex,
      });
    }

    /** Map token names to universe index */
    if (!tokenNamesToUniverseIndex.has(baseTokenMeta.name)) {
      tokenNamesToUniverseIndex.set(
        baseTokenMeta.name,
        new Map<string, number>(),
      );
    }

    tokenNamesToUniverseIndex
      .get(baseTokenMeta.name)
      ?.set(quoteTokenMeta.name, index);

    /** Map token indexes to spot index */
    if (!tokensToSpotId.has(baseIndex)) {
      tokensToSpotId.set(baseIndex, new Map<number, number>());
    }

    tokensToSpotId.get(baseIndex)?.set(quoteIndex, universe.index);
  }

  return {
    tokenNamesToUniverseIndex,
    tokensToSpotId,
    spotNamesToTokens,
    spotMeta: data,
  };
};

export const mapDataToPerpsMetas = (data: AllPerpMetasResponse) => {
  const metas = [];

  for (let index = 0; index < data.length; index++) {
    const meta = data[index];
    const { dex } = parseBuilderDeployedAsset(meta.universe[0].name);

    metas.push({
      ...meta,
      perpDexIndex: index,
      dex,
    });
  }

  return metas;
};
