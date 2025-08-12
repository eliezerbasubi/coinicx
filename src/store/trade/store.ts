import { createContext } from "react";
import { create } from "zustand";

import { TradeMarketTicker, TradeType } from "@/types/trade";
import { ROUTES } from "@/constants/routes";

interface SelectedAsset {
  baseAsset: string;
  quoteAsset: string;
}

export interface TradeStoreProps {
  baseAsset: string;
  quoteAsset: string;
  tradeType: TradeType;
  marketTicker?: TradeMarketTicker;
}

export interface TradeStoreState extends TradeStoreProps {
  symbol: string;
  setSelectedAsset: (asset: SelectedAsset) => void;
  onTradeTypeChange: (tradeType: TradeType) => void;
  setMarketTicker: (ticker: Partial<TradeMarketTicker>) => void;
}

export const createTradeStore = (initialProps: TradeStoreProps) => {
  return create<TradeStoreState>()((set, get) => ({
    ...initialProps,
    symbol: initialProps.baseAsset + initialProps.quoteAsset,
    setSelectedAsset: (asset) =>
      set({
        baseAsset: asset.baseAsset,
        quoteAsset: asset.quoteAsset,
        symbol: asset.baseAsset + asset.quoteAsset,
      }),
    setMarketTicker: (ticker) =>
      set((state) => ({
        marketTicker: state.marketTicker
          ? { ...state.marketTicker, ...ticker }
          : undefined,
      })),
    onTradeTypeChange: (tradeType) => {
      const { baseAsset, quoteAsset } = get();

      const newPath = [
        ROUTES.trade.index,
        tradeType,
        baseAsset,
        quoteAsset,
      ].join("/");

      window.history.replaceState({}, "", newPath);

      set({ tradeType });
    },
  }));
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);
