import { createContext } from "react";
import { create } from "zustand";

import { InstrumentType } from "@/types/trade";

import { useOrderFormStore } from "./order-form";

export interface TradeStoreProps {
  base: string;
  quote: string;
  coin: string;
  instrumentType: InstrumentType;
}

export interface TradeStoreState extends TradeStoreProps {
  /** Decimals for the selected asset */
  decimals: number | null;
  onAssetChange: (data: {
    base: string;
    quote: string;
    instrumentType: InstrumentType;
  }) => void;
  setDecimals: (decimals: number) => void;
}

export const createTradeStore = (initialProps: TradeStoreProps) => {
  return create<TradeStoreState>()((set) => ({
    ...initialProps,
    decimals: null,
    onAssetChange: (data) => {
      set({ ...data });

      useOrderFormStore.getState().reset();
    },
    setDecimals: (decimals) => set({ decimals }),
  }));
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);
