import { createContext } from "react";
import { create } from "zustand";

interface SelectedAsset {
  baseAsset: string;
  quoteAsset: string;
}

export interface SpotTradeProps {
  baseAsset: string;
  quoteAsset: string;
}

export interface SpotTradeState extends SpotTradeProps {
  symbol: string;
  setSelectedAsset: (asset: SelectedAsset) => void;
}

export const createSpotTradeStore = (initialProps: SpotTradeProps) => {
  return create<SpotTradeState>()((set) => ({
    ...initialProps,
    symbol: initialProps.baseAsset + initialProps.quoteAsset,
    setSelectedAsset: (asset) =>
      set({
        baseAsset: asset.baseAsset,
        quoteAsset: asset.quoteAsset,
        symbol: asset.baseAsset + asset.quoteAsset,
      }),
  }));
};

export type SpotTradeStore = ReturnType<typeof createSpotTradeStore>;
export const SpotTradeContext = createContext<SpotTradeStore | null>(null);
