import { createContext } from "react";
import { create } from "zustand";

import { InstrumentType } from "@/types/trade";

export interface TradeStoreProps {
  base: string;
  quote: string;
  instrumentType: InstrumentType;
}

export interface TradeStoreState extends TradeStoreProps {
  onAssetChange: (data: {
    base: string;
    quote: string;
    instrumentType: InstrumentType;
  }) => void;
}

export const createTradeStore = (initialProps: TradeStoreProps) => {
  return create<TradeStoreState>()((set, get) => ({
    ...initialProps,
    onAssetChange: (data) => set({ ...data }),
  }));
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);
