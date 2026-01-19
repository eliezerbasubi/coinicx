import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";

import { AssetCxt, AssetMeta } from "@/types/trade";

interface InstrumentStoreState {
  assetMeta: AssetMeta | null;
  assetCtx: AssetCxt | null;
  setTokenMeta: (data: AssetMeta) => void;
  setAssetCtx: (
    data: ActiveSpotAssetCtxWsEvent["ctx"] | ActiveAssetCtxWsEvent["ctx"],
  ) => void;
}

export const useInstrumentStore = create<InstrumentStoreState>()((set) => ({
  assetMeta: null,
  assetCtx: null,
  setTokenMeta: (data) => set({ assetMeta: data }),
  setAssetCtx: (data) => {
    const markPx = Number(data.markPx);

    const ctx: AssetCxt = {
      markPx,
      midPx: Number(data.midPx),
      prevDayPx: Number(data.prevDayPx),
      dayBaseVlm: Number(data.dayBaseVlm),
      dayNtlVlm: Number(data.dayNtlVlm),
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
    }

    set({ assetCtx: ctx });
  },
}));
