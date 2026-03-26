import { createContext } from "react";
import { create } from "zustand";

import { InstrumentType } from "@/lib/types/trade";
import { getPriceDecimals } from "@/features/trade/utils";

import { useInstrumentStore } from "./instrument";
import { useOrderFormStore } from "./order-form";
import { useOrderBookStore } from "./orderbook";

export interface TradeStoreProps {
  base: string;
  quote: string;
  coin: string;
  instrumentType: InstrumentType;
}

export interface TradeStoreState extends TradeStoreProps {
  /** Price decimals of the current asset */
  decimals: number | null;
  onAssetChange: (data: {
    base: string;
    quote: string;
    coin: string;
    instrumentType: InstrumentType;
    /** Price of the asset (midPx or markPx) to build price decimals and orderbook ticks */
    price: number;
    /** Decimals of the asset */
    szDecimals: number;
    /** Dex of the asset */
    dex?: string | null;
    /** Perp dex index of the asset */
    perpDexIndex?: number;
    /** Index of the asset */
    assetIndex?: number;
  }) => void;
  setDecimals: (decimals: number) => void;
}

export const createTradeStore = (initialProps: TradeStoreProps) => {
  return create<TradeStoreState>()((set) => ({
    ...initialProps,
    decimals: null,
    onAssetChange: (data) => {
      const isSpot = data.instrumentType === "spot";

      // Reset order form
      useOrderFormStore.getState().reset();

      // Ensure ticks are only loaded once asset is selected
      useOrderBookStore
        .getState()
        .setTicks(data.price, data.szDecimals, isSpot);

      // Calculate price decimals
      const pxDecimals = data.price
        ? getPriceDecimals(data.price, data.szDecimals, isSpot)
        : null;

      // Update asset meta and context
      useInstrumentStore.getState().setTokenMetaAndAssetCtx({
        dex: data.dex ?? "",
        perpDexIndex: data.perpDexIndex ?? 0,
        assetIndex: data.assetIndex ?? 0,
        isSpot,
      });

      set({
        decimals: pxDecimals,
        base: data.base,
        quote: data.quote,
        coin: data.coin,
        instrumentType: data.instrumentType,
      });
    },
    setDecimals: (decimals) => set({ decimals }),
  }));
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);
