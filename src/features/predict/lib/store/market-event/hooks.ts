import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";

import {
  defaultSideCtx,
  MarketEventContext,
  MarketEventStoreState,
} from "./store";

export const useMarketEventContext = <T>(
  selector: (state: MarketEventStoreState) => T,
): T => {
  const store = useContext(MarketEventContext);
  if (!store)
    throw new Error("Missing MarketEventContext.Provider in the tree");

  return useStore(store, useShallow(selector));
};

export const useActiveOutcomeMeta = () => {
  const data = useMarketEventContext((s) => ({
    activeOutcomeIndex: s.activeOutcomeIndex,
    marketEventMeta: s.marketEventMeta,
  }));

  return data;
};

export const useActiveOutcomeSideCtx = () => {
  const predictSideIndex = useShallowOrderFormStore((s) => s.predictSideIndex);

  const { activeOutcomeIndex, sides } = useMarketEventContext((s) => ({
    activeOutcomeIndex: s.activeOutcomeIndex,
    sides:
      s.marketEventCtx.outcomes[s.activeOutcomeIndex]?.sides ??
      s.marketEventCtx.sides,
  }));

  return {
    sideCtx: sides[predictSideIndex] ?? defaultSideCtx,
    sideIndex: predictSideIndex,
    activeOutcomeIndex,
  };
};
