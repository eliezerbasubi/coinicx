import { createContext } from "react";
import { create } from "zustand";

import { MarketEventCtx, MarketEventMeta } from "@/features/predict/lib/types";

export interface MarketEventStoreProps {
  marketEventMeta: MarketEventMeta;
  categoricalOutcomeIndex?: number;
}

export interface MarketEventStoreState extends MarketEventStoreProps {
  /** The currently active market outcome. Only applicable for categorical markets */
  activeOutcomeIndex: number;
  marketEventCtx: MarketEventCtx;

  /** The currently active chart outcome side index. @default 0 for yes side */
  chartOutcomeSideIndex: number;

  tradingWidgetDrawerOpen: boolean;

  openTradingWidgetDrawer: (open: boolean) => void;
  setActiveOutcomeIndex: (outcomeIndex: number) => void;
  setMarketEventCtx: (marketEventCtx: MarketEventCtx) => void;
  setChartOutcomeSideIndex: (sideIndex: number) => void;
}

const defaultSide = {
  volume: 0,
  volumeInBase: 0,
  markPx: 0,
  midPx: 0,
  prevDayPx: 0,
  openInterest: 0,
};

export const createMarketEventStore = (initialProps: MarketEventStoreProps) => {
  return create<MarketEventStoreState>()((set) => ({
    ...initialProps,
    activeOutcomeIndex: initialProps.categoricalOutcomeIndex ?? 0,
    chartOutcomeSideIndex: 0,
    tradingWidgetDrawerOpen: false,
    marketEventCtx: {
      openInterest: 0,
      volume: 0,
      sides: [defaultSide, defaultSide],
      outcomes: [],
    },
    openTradingWidgetDrawer: (open: boolean) =>
      set({ tradingWidgetDrawerOpen: open }),
    setMarketEventCtx: (marketEventCtx: MarketEventCtx) =>
      set({ marketEventCtx }),
    setActiveOutcomeIndex: (index: number) =>
      set({ activeOutcomeIndex: index }),
    setChartOutcomeSideIndex: (sideIndex: number) =>
      set({ chartOutcomeSideIndex: sideIndex }),
  }));
};

export type MarketEventStore = ReturnType<typeof createMarketEventStore>;
export const MarketEventContext = createContext<MarketEventStore | null>(null);
