import { createContext } from "react";
import { create } from "zustand";

import { useOrderFormStore } from "@/lib/store/trade/order-form";
import {
  MarketEventCtx,
  MarketEventMeta,
  MarketEventStatus,
} from "@/features/predict/lib/types";
import { parsePriceToFormat, roundToDecimals } from "@/features/trade/utils";

type MarketEventState = {
  marketEventMeta: MarketEventMeta;

  /** The currently active market outcome. Only applicable for categorical markets */
  activeOutcomeIndex: number;
  marketEventCtx: MarketEventCtx;

  /** The currently active chart outcome side index. @default 0 for yes side */
  chartOutcomeSideIndex: number;

  tradingWidgetDrawerOpen: boolean;

  /** Controls whether the trading widget should be reset when the market event is mounted. @default true */
  resetTradingWidgetOnMount?: boolean;
};

export type MarketEventStoreProps = {
  categoricalOutcomeIndex?: number;
} & Pick<MarketEventState, "marketEventMeta">;

type MarketEventActions = {
  /** Returns the current state of the store */
  getState: () => MarketEventState;
  openTradingWidgetDrawer: (
    open: boolean,
    opts?: { resetOnMount?: boolean },
  ) => void;
  setActiveOutcomeIndex: (outcomeIndex: number) => void;
  setMarketEventCtx: (marketEventCtx: MarketEventCtx) => void;
  setChartOutcomeSideIndex: (sideIndex: number) => void;
  setOutcomeSideIndex: (sideIndex: number) => void;
  updateMarketEventStatus: (status: MarketEventStatus) => void;
};

export type MarketEventStoreState = MarketEventState & MarketEventActions;

export const defaultSideCtx = {
  volume: 0,
  volumeInBase: 0,
  markPx: 0,
  midPx: 0,
  prevDayPx: 0,
  openInterest: 0,
};

export const createMarketEventStore = (initialProps: MarketEventStoreProps) => {
  return create<MarketEventStoreState>()((set, get) => ({
    ...initialProps,
    activeOutcomeIndex: initialProps.categoricalOutcomeIndex ?? 0,
    chartOutcomeSideIndex: 0,
    tradingWidgetDrawerOpen: false,
    resetTradingWidgetOnMount: true,
    marketEventCtx: {
      openInterest: 0,
      volume: 0,
      sides: [defaultSideCtx, defaultSideCtx],
      outcomes: [],
    },
    getState: () => get(),
    updateMarketEventStatus: (status: MarketEventStatus) => {
      const { marketEventMeta } = get();
      set({ marketEventMeta: { ...marketEventMeta, status } });
    },
    openTradingWidgetDrawer: (open, opts) => {
      set({
        tradingWidgetDrawerOpen: open,
        resetTradingWidgetOnMount: opts?.resetOnMount ?? true,
      });
    },
    setMarketEventCtx: (marketEventCtx: MarketEventCtx) =>
      set({ marketEventCtx }),
    setActiveOutcomeIndex: (index) => {
      const { marketEventCtx } = get();

      set({ activeOutcomeIndex: index });

      // Set limit price of the current outcome
      const sideIndex = useOrderFormStore.getState().predictSideIndex;

      const sideCtx = marketEventCtx.outcomes[index].sides[sideIndex];
      const mid = sideCtx?.midPx || sideCtx.markPx;

      useOrderFormStore
        .getState()
        .onMidClick(
          roundToDecimals(parsePriceToFormat(mid, "toCents"), 1, "floor"),
        );
    },
    setOutcomeSideIndex: (sideIndex) => {
      const { marketEventCtx, activeOutcomeIndex } = get();

      useOrderFormStore.getState().setPredictSideIndex(sideIndex);

      // Set limit price of the current outcome
      const sidesCtxs =
        marketEventCtx.outcomes[activeOutcomeIndex]?.sides ??
        marketEventCtx.sides;

      const sideCtx = sidesCtxs[sideIndex];
      const mid = sideCtx?.midPx || sideCtx.markPx;

      useOrderFormStore
        .getState()
        .onMidClick(
          roundToDecimals(parsePriceToFormat(mid, "toCents"), 1, "floor"),
        );
    },
    setChartOutcomeSideIndex: (sideIndex: number) =>
      set({ chartOutcomeSideIndex: sideIndex }),
  }));
};

export type MarketEventStore = ReturnType<typeof createMarketEventStore>;
export const MarketEventContext = createContext<MarketEventStore | null>(null);
