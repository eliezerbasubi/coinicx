import { createContext } from "react";
import { create } from "zustand";

import { InstrumentType } from "@/types/trade";

export interface TradeStoreProps {
  base: string;
  quote: string;
  instrumentType: InstrumentType;

  /** Decimals for the selected asset */
  decimals: number | null;
}

export interface TradeStoreState extends TradeStoreProps {
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
    onAssetChange: (data) => set({ ...data }),
    setDecimals: (decimals) => set({ decimals }),
  }));
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);
