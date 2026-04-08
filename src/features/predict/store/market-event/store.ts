import { createContext } from "react";
import { create } from "zustand";

import {
  MarketEvent,
  MarketOutcome,
  ParsedRecurringMetadata,
} from "@/features/predict/types";

export interface MarketEventStoreProps {
  marketEvent: MarketEvent & ParsedRecurringMetadata;

  /** The currently active market outcome. Only applicable for categorical markets */
  activeMarketOutcome?: MarketOutcome;
}

export interface MarketEventStoreState extends MarketEventStoreProps {
  setActiveMarketOutcome: (outcome: MarketOutcome) => void;
}

export const createMarketEventStore = (initialProps: MarketEventStoreProps) => {
  return create<MarketEventStoreState>()((set) => ({
    ...initialProps,
    setActiveMarketOutcome: (outcome: MarketOutcome) =>
      set({ activeMarketOutcome: outcome }),
  }));
};

export type MarketEventStore = ReturnType<typeof createMarketEventStore>;
export const MarketEventContext = createContext<MarketEventStore | null>(null);
