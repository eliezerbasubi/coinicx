import React, { createContext, useContext, useMemo, useReducer } from "react";

import { MetaAndAssetCtx } from "@/types/trade";
import { useSubscription } from "@/hooks/useSubscription";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import {
  mapPerpDataToAssetMeta,
  parseBuilderDeployedAsset,
  parseQuoteAsset,
} from "@/features/trade/utils";
import { hlSubClient } from "@/services/transport";

type Props = {
  children: React.ReactNode;
};

type InstrumentAssetCtxs = Record<"perps" | "spot", MetaAndAssetCtx[]>;

type State = {
  metaAndAssetCtxs: InstrumentAssetCtxs;
};

const TickerSelectorContext = createContext<State>({
  metaAndAssetCtxs: { spot: [], perps: [] },
});

export const useTickerSelector = () => {
  const context = useContext(TickerSelectorContext);
  if (!context)
    throw new Error("Missing TickerSelectorContext.Provider in the tree");

  return context.metaAndAssetCtxs;
};

const TickerSelectorProvider = ({ children }: Props) => {
  const { data, getAllSpotAssetsMetas, getAllPerpDexsAndMetas } =
    useMetaAndAssetCtxs();

  const [state, dispatch] = useReducer(
    (prev: InstrumentAssetCtxs, next: Partial<InstrumentAssetCtxs>) => ({
      ...prev,
      ...next,
    }),
    { perps: [], spot: [] },
  );

  useSubscription(() => {
    const allSpotAssetsMetas = getAllSpotAssetsMetas();

    if (!allSpotAssetsMetas) return;

    return hlSubClient.spotAssetCtxs((data) => {
      const metaAndAssetCtxs: Array<MetaAndAssetCtx> = [];

      for (const datum of data) {
        const meta = allSpotAssetsMetas.get(datum.coin);

        // skip assets with no data
        if (!meta || !datum.midPx || !datum.markPx || !datum.dayBaseVlm)
          continue;

        metaAndAssetCtxs.push({
          isSpot: true,
          meta,
          ctx: {
            markPx: Number(datum.markPx),
            midPx: Number(datum.midPx),
            dayNtlVlm: Number(datum.dayNtlVlm),
            dayBaseVlm: Number(datum.dayBaseVlm),
            prevDayPx: Number(datum.prevDayPx),
            marketCap: Number(datum.midPx) * Number(datum.circulatingSupply),
            funding: null,
            openInterest: null,
            oraclePx: null,
          },
        });
      }

      dispatch({ spot: metaAndAssetCtxs });
    });
  }, [getAllSpotAssetsMetas]);

  useSubscription(() => {
    const perpDexsAndMeta = getAllPerpDexsAndMetas();
    const spotMeta = data.spotMeta;

    if (!perpDexsAndMeta.size) return;

    return hlSubClient.allDexsAssetCtxs((data) => {
      const dexsAssetCtxs = new Map(data.ctxs);
      const metaAndAssetCtxs: Array<MetaAndAssetCtx> = [];

      for (const [dex, ctxs] of dexsAssetCtxs) {
        const perpDex = perpDexsAndMeta.get(dex);

        if (!perpDex) continue;

        for (let index = 0; index < perpDex.meta.universe.length; index++) {
          const universe = perpDex.meta.universe[index];
          const collateralToken = perpDex.meta.collateralToken;
          const ctx = ctxs[index];

          if (!ctx) continue;

          const deployedAsset = parseBuilderDeployedAsset(universe.name);
          const quote = parseQuoteAsset(spotMeta?.tokens[collateralToken].name);

          // skip assets with no data
          if (!ctx.midPx || !ctx.markPx || !ctx.dayBaseVlm) continue;

          metaAndAssetCtxs.push({
            isSpot: false,
            ctx: {
              midPx: Number(ctx.midPx ?? 0),
              markPx: Number(ctx.markPx ?? 0),
              dayNtlVlm: Number(ctx.dayNtlVlm),
              dayBaseVlm: Number(ctx.dayBaseVlm),
              prevDayPx: Number(ctx.prevDayPx),
              funding: Number(ctx.funding),
              openInterest: Number(ctx.openInterest),
              oraclePx: Number(ctx.oraclePx),
              marketCap: null,
            },
            meta: mapPerpDataToAssetMeta({
              universe,
              quote,
              ...deployedAsset,
              index,
            }),
          });
        }
      }

      dispatch({ perps: metaAndAssetCtxs });
    });
  }, [getAllPerpDexsAndMetas, data.spotMeta]);

  const value = useMemo(
    () => ({ metaAndAssetCtxs: state }),
    [state.perps, state.spot],
  );

  return (
    <TickerSelectorContext.Provider value={value}>
      {children}
    </TickerSelectorContext.Provider>
  );
};

export default TickerSelectorProvider;
