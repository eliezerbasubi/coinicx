import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { Asset } from "@/lib/types/trade";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import {
  formatSymbol,
  parseBuilderDeployedAsset,
  parseQuoteAsset,
} from "@/features/trade/utils";

export const useAssetsAndContexts = () => {
  const { spotMeta, perpMetas } = useAssetMetas();

  const { spotAssetCtxs, allDexsAssetCtxs } = useShallowInstrumentStore(
    (s) => ({
      spotAssetCtxs: s.spotAssetCtxs,
      allDexsAssetCtxs: s.allDexsAssetCtxs,
    }),
  );

  const spotAssets = useMemo<Asset[]>(() => {
    if (!spotMeta) return [];

    const assets = [];

    for (let index = 0; index < spotMeta.universe.length; index++) {
      const universe = spotMeta.universe[index];
      const spotId = universe.index;
      const [baseIndex, quoteIndex] = universe.tokens;

      const baseTokenMeta = spotMeta.tokens[baseIndex];
      const quoteTokenMeta = spotMeta.tokens[quoteIndex];

      const context = spotAssetCtxs[spotId];

      if (!context || !baseTokenMeta || !quoteTokenMeta) continue;

      assets.push({
        isSpot: true,
        dex: null,
        index,
        coin: universe.name,
        base: baseTokenMeta.name,
        quote: quoteTokenMeta.name,
        szDecimals: baseTokenMeta.szDecimals,
        symbol: formatSymbol(baseTokenMeta.name, quoteTokenMeta.name, true),
        markPx: Number(context.markPx),
        midPx: Number(context.midPx),
        dayNtlVlm: Number(context.dayNtlVlm),
        dayBaseVlm: Number(context.dayBaseVlm),
        prevDayPx: Number(context.prevDayPx),
        marketCap: Number(context.midPx) * Number(context.circulatingSupply),
        funding: null,
        openInterest: null,
        oraclePx: null,
        maxLeverage: null,
      });
    }

    return assets;
  }, [spotAssetCtxs, spotMeta]);

  const perpAssets = useMemo<Asset[]>(() => {
    if (!perpMetas) return [];

    const assets = [];

    const dexsAssetCtxs = new Map(allDexsAssetCtxs);

    for (const perpDexState of perpMetas) {
      const ctxs = dexsAssetCtxs.get(perpDexState.dex);

      if (!ctxs) continue;

      for (let index = 0; index < perpDexState.universe.length; index++) {
        const universe = perpDexState.universe[index];
        const collateralToken = perpDexState.collateralToken;
        const ctx = ctxs[index];

        const spotAsset = spotMeta?.tokens[collateralToken];

        if (!ctx || universe.isDelisted || !spotAsset) continue;

        const { dex, base } = parseBuilderDeployedAsset(universe.name);
        const quote = parseQuoteAsset(spotAsset.name);

        const markPx = Number(ctx.markPx || 0);
        const midPx = Number(ctx.midPx || 0);
        const dayBaseVlm = Number(ctx.dayBaseVlm || 0);

        assets.push({
          isSpot: false,
          dex,
          base,
          quote,
          index,
          coin: universe.name,
          szDecimals: universe.szDecimals,
          perpDexIndex: perpDexState.perpDexIndex,
          symbol: formatSymbol(base, quote, false),
          midPx,
          markPx,
          dayNtlVlm: Number(ctx.dayNtlVlm),
          dayBaseVlm,
          prevDayPx: Number(ctx.prevDayPx),
          funding: 8 * Number(ctx.funding || 0) * 100,
          openInterest: Number(ctx.openInterest || 0) * markPx,
          oraclePx: Number(ctx.oraclePx),
          marketCap: null,
          maxLeverage: universe.maxLeverage,
        });
      }
    }

    return assets;
  }, [allDexsAssetCtxs, perpMetas]);

  return useMemo(
    () => ({ spot: spotAssets, perps: perpAssets }),
    [spotAssets, perpAssets],
  );
};
