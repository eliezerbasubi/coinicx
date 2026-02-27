import React, { createContext, useContext, useMemo } from "react";

import { Asset } from "@/types/trade";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import {
  formatSymbol,
  parseBuilderDeployedAsset,
  parseQuoteAsset,
} from "@/features/trade/utils";
import { useShallowInstrumentStore } from "@/store/trade/instrument";

type Props = {
  children: React.ReactNode;
};

type InstrumentAssetCtxs = Record<"perps" | "spot", Asset[]>;

type State = {
  assets: InstrumentAssetCtxs;
};

const TickerSelectorContext = createContext<State>({
  assets: { spot: [], perps: [] },
});

export const useTickerSelector = () => {
  const context = useContext(TickerSelectorContext);
  if (!context)
    throw new Error("Missing TickerSelectorContext.Provider in the tree");

  return context.assets;
};

const TickerSelectorProvider = ({ children }: Props) => {
  const { spotMeta, perpMetas } = useMetaAndAssetCtxs();

  const { spotAssetCtxs, allDexsAssetCtxs } = useShallowInstrumentStore(
    (s) => ({
      spotAssetCtxs: s.spotAssetCtxs,
      allDexsAssetCtxs: s.allDexsAssetCtxs,
    }),
  );

  const spotAssets = useMemo(() => {
    if (!spotMeta) return [];

    const assets = [];

    for (let index = 0; index < spotMeta.universe.length; index++) {
      const universe = spotMeta.universe[index];
      const tokenIndex = universe.index;
      const [baseIndex, quoteIndex] = universe.tokens;

      const token = spotMeta.tokens[tokenIndex];
      const baseTokenMeta = spotMeta.tokens[baseIndex];
      const quoteTokenMeta = spotMeta.tokens[quoteIndex];

      const context = spotAssetCtxs[tokenIndex];

      if (!context) continue;

      assets.push({
        isSpot: true,
        dex: null,
        index,
        coin: universe.name,
        base: baseTokenMeta.name,
        quote: quoteTokenMeta.name,
        szDecimals: token.szDecimals,
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

  const perpAssets = useMemo(() => {
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

        if (!ctx || universe.isDelisted) continue;

        const { dex, base } = parseBuilderDeployedAsset(universe.name);
        const quote = parseQuoteAsset(spotMeta?.tokens[collateralToken].name);

        const markPx = Number(ctx.markPx || 0);
        const midPx = Number(ctx.midPx || 0);
        const dayBaseVlm = Number(ctx.dayBaseVlm || 0);

        // skip assets with no data
        if (!midPx || !markPx || !dayBaseVlm) continue;

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

  const value = useMemo(
    () => ({ assets: { spot: spotAssets, perps: perpAssets } }),
    [spotAssets, perpAssets],
  );

  return (
    <TickerSelectorContext.Provider value={value}>
      {children}
    </TickerSelectorContext.Provider>
  );
};

export default TickerSelectorProvider;
