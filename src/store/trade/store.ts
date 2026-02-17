import { createContext } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { InstrumentType, OrderSide, OrderType } from "@/types/trade";

export interface TradeStoreProps {
  base: string;
  quote: string;
  coin: string;
  instrumentType: InstrumentType;
}

type OrderFormSettings = {
  isSzInNtl: boolean;
  orderType: OrderType;
  showTpSl: boolean;
  reduceOnly: boolean;
  timeInForce: string;
  maxSlippage?: number;
};

export interface TradeStoreState extends TradeStoreProps {
  /** Decimals for the selected asset */
  decimals: number | null;
  orderFormSettings: OrderFormSettings;
  orderSide: OrderSide;
  onAssetChange: (data: {
    base: string;
    quote: string;
    instrumentType: InstrumentType;
  }) => void;
  setDecimals: (decimals: number) => void;
  setOrderSide: (orderSide: OrderSide) => void;
  setOrderFormSettings: (settings: Partial<OrderFormSettings>) => void;
}

export const createTradeStore = (initialProps: TradeStoreProps) => {
  return create<TradeStoreState>()(
    persist(
      (set) => ({
        ...initialProps,
        decimals: null,
        orderSide: "buy",
        orderFormSettings: {
          isSzInNtl: false,
          orderType: "limit",
          showTpSl: false,
          reduceOnly: false,
          timeInForce: "Gtc",
        },
        onAssetChange: (data) => set({ ...data }),
        setDecimals: (decimals) => set({ decimals }),
        setOrderSide: (orderSide) => set({ orderSide }),
        setOrderFormSettings: (settings) =>
          set((state) => ({
            orderFormSettings: { ...state.orderFormSettings, ...settings },
          })),
      }),
      {
        name: "orderform-settings",
        partialize: (state) => ({
          orderFormSettings: state.orderFormSettings,
        }),
      },
    ),
  );
};

export type TradeStore = ReturnType<typeof createTradeStore>;
export const TradeContext = createContext<TradeStore | null>(null);
