import { createContext } from "react";
import { create } from "zustand";

import { MarketEvent, ParsedRecurringMetadata } from "@/features/predict/types";

export interface MarketEventStoreProps {
  marketEvent: MarketEvent & ParsedRecurringMetadata;
}

export interface MarketEventStoreState extends MarketEventStoreProps {
  /** The currently active market outcome. Only applicable for categorical markets */
  activeOutcomeIndex: number;
  setActiveOutcomeIndex: (index: number) => void;
}

export const createMarketEventStore = (initialProps: MarketEventStoreProps) => {
  return create<MarketEventStoreState>()((set) => ({
    ...initialProps,
    activeOutcomeIndex: 0,
    setActiveOutcomeIndex: (index: number) =>
      set({ activeOutcomeIndex: index }),
  }));
};

export type MarketEventStore = ReturnType<typeof createMarketEventStore>;
export const MarketEventContext = createContext<MarketEventStore | null>(null);
