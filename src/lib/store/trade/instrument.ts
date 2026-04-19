import {
  AllDexsAssetCtxsWsEvent,
  SpotAssetCtxsWsEvent,
} from "@nktkas/hyperliquid";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface InstrumentStoreState {
  spotAssetCtxs: SpotAssetCtxsWsEvent;
  allDexsAssetCtxs: AllDexsAssetCtxsWsEvent["ctxs"];
  applySpotAssetCtxs: (data: SpotAssetCtxsWsEvent) => void;
  applyAllDexsAssetCtxs: (data: AllDexsAssetCtxsWsEvent["ctxs"]) => void;
}

export const useInstrumentStore = create<InstrumentStoreState>()((set) => ({
  spotAssetCtxs: [],
  allDexsAssetCtxs: [],
  applySpotAssetCtxs(data) {
    set({ spotAssetCtxs: data });
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
