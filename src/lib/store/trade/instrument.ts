import {
  AllDexsAssetCtxsWsEvent,
  SpotAssetCtxsWsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type SpotAssetCtx = Record<string, SpotAssetCtxsWsEvent[number]>;

interface InstrumentStoreState {
  spotAssetCtxs: SpotAssetCtx;
  allDexsAssetCtxs: AllDexsAssetCtxsWsEvent["ctxs"];
  applySpotAssetCtxs: (data: SpotAssetCtxsWsEvent) => void;
  applyAllDexsAssetCtxs: (data: AllDexsAssetCtxsWsEvent["ctxs"]) => void;
}

export const useInstrumentStore = create<InstrumentStoreState>()((set) => ({
  spotAssetCtxs: {},
  allDexsAssetCtxs: [],
  applySpotAssetCtxs(data) {
    const spotAssetCtxs = data.reduce(
      (acc, curr) => {
        acc[curr.coin] = curr;
        return acc;
      },
      {} as Record<string, SpotAssetCtxsWsEvent[number]>,
    );

    set({ spotAssetCtxs });
  },
  applyAllDexsAssetCtxs(data) {
    set({ allDexsAssetCtxs: data });
  },
}));

export const useShallowInstrumentStore = <T>(
  selector: (state: InstrumentStoreState) => T,
) => {
  return useInstrumentStore(useShallow(selector));
};
