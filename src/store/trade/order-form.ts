import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { OrderSide, OrderType } from "@/types/trade";

import { useInstrumentStore } from "./instrument";
import { useUserTradeStore } from "./user-trade";

type OrderFormSettings = {
  isSzInNtl: boolean;
  orderType: OrderType;
  showTpSl: boolean;
  reduceOnly: boolean;
  timeInForce: string;
  maxSlippage?: number;
};

type ScaleFormState = {
  startPrice: string;
  endPrice: string;
  totalOrders: string;
  skew: string;
};

type ExecutionOrderParams = {
  size: string;
  limitPrice: string;
  triggerPrice: string;
};

type TPSLState = {
  tpPrice: string;
  slPrice: string;
};

type OrderFormState = {
  orderSide: OrderSide;
  szPercent: number;
  scaleFormState: ScaleFormState;
  settings: OrderFormSettings;
  tpslState: TPSLState;
} & ExecutionOrderParams;

type OrderFormActions = {
  setOrderSide: (orderSide: OrderSide) => void;
  setSettings: (settings: Partial<OrderFormSettings>) => void;
  setTpslState: (data: Partial<TPSLState>) => void;
  setScaleFormState: (data: Partial<ScaleFormState>) => void;
  setExecutionOrderParams: (data: Partial<ExecutionOrderParams>) => void;
  onSizeCoinChange: (isNtl: boolean) => void;
  onPercentChange: (percent: number) => void;
  onSizeChange: (size: string) => void;
  onOrderSideChange: (orderSide: OrderSide, isSpot: boolean) => void;
  onMidClick: () => void;
  getSizeInBase: (midPx?: number) => number;
  reset: () => void;
  calculateOrderSize: (args: {
    isSpot: boolean;
    isBuyOrder?: boolean;
  }) => number;
};

type OrderFormStore = OrderFormState & OrderFormActions;

const initialState: OrderFormState = {
  orderSide: "buy",
  size: "",
  szPercent: 0,
  limitPrice: "",
  triggerPrice: "",
  tpslState: {
    tpPrice: "",
    slPrice: "",
  },
  settings: {
    isSzInNtl: false,
    orderType: "limit",
    showTpSl: false,
    reduceOnly: false,
    timeInForce: "Gtc",
  },
  scaleFormState: {
    startPrice: "",
    endPrice: "",
    totalOrders: "",
    skew: "",
  },
};

export const useOrderFormStore = create<OrderFormStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setOrderSide: (orderSide) => set({ orderSide }),
      setTpslState(data) {
        set((state) => ({ ...state, ...data }));
      },
      setExecutionOrderParams(data) {
        set((state) => ({ ...state, ...data }));
      },
      getSizeInBase(midPx?: number) {
        const { size, settings } = get();
        const mid = midPx ?? getInstrumentData().midPx;
        const parsedSize = parseFloat(size || "0");
        return settings.isSzInNtl ? parsedSize / mid : parsedSize;
      },
      setSettings(settings) {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      setScaleFormState(data) {
        set((state) => ({
          scaleFormState: { ...state.scaleFormState, ...data },
        }));
      },
      calculateOrderSize({ isSpot, isBuyOrder }) {
        const { orderSide, settings } = get();
        const { midPx } = getInstrumentData();

        const isBuy = isBuyOrder ?? orderSide === "buy";

        const availableBalance = useUserTradeStore
          .getState()
          .getOrderAvailableBalance({
            isBuyOrder: isBuy,
            isSpot,
          });

        const maxOrderSize = calculateOrderSize({
          isBuyOrder: isBuy,
          isSpot,
          isSzInNtl: settings.isSzInNtl,
          availableBalance,
          midPx,
        });

        return maxOrderSize;
      },
      onSizeCoinChange(isNtl: boolean) {
        const { size, settings } = get();
        const { midPx, szDecimals } = getInstrumentData();

        const currentSize = parseFloat(size);
        const newSize = isNtl ? currentSize * midPx : currentSize / midPx;

        const fractionDigits = isNtl ? 2 : szDecimals;

        set({
          size: newSize.toFixed(fractionDigits),
          settings: { ...settings, isSzInNtl: isNtl },
        });
      },
      onPercentChange(percent: number) {
        const { settings, calculateOrderSize } = get();
        const { szDecimals } = getInstrumentData();

        const maxOrderSize = calculateOrderSize({
          isSpot: false,
          isBuyOrder: false,
        });

        const size = (maxOrderSize * percent) / 100;
        const fractionDigits = settings.isSzInNtl ? 2 : szDecimals;

        set({
          szPercent: percent,
          size: size.toFixed(fractionDigits),
        });
      },

      onSizeChange(size: string) {
        const { calculateOrderSize } = get();

        const maxOrderSize = calculateOrderSize({
          isSpot: false,
          isBuyOrder: false,
        });

        const percent = Math.floor(
          (parseFloat(size || "0") / maxOrderSize) * 100,
        );

        set({ size, szPercent: Math.min(percent, 100) });
      },

      onOrderSideChange(orderSide: OrderSide, isSpot: boolean) {
        const { size, calculateOrderSize } = get();

        const isBuyOrder = orderSide === "buy";

        if (parseFloat(size)) {
          const maxOrderSize = calculateOrderSize({ isSpot, isBuyOrder });

          const percent = (parseFloat(size) / maxOrderSize) * 100;
          set({ szPercent: Math.min(percent, 100) });
        }

        set({ orderSide });
      },

      onMidClick() {
        const { midPx } = getInstrumentData();
        set({ limitPrice: midPx.toString() });
      },
      reset() {
        set((state) => ({
          ...initialState,
          orderSide: state.orderSide,
          settings: state.settings,
        }));
      },
    }),
    {
      name: "orderform-storage",
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
);

export const useShallowOrderFormStore = <T>(
  selector: (state: OrderFormStore) => T,
) => {
  return useOrderFormStore(useShallow(selector));
};

const getInstrumentData = () => {
  const { assetCtx, assetMeta } = useInstrumentStore.getState();
  return {
    midPx: assetCtx?.midPx || 0,
    szDecimals: assetMeta?.szDecimals || 0,
  };
};

const calculateOrderSize = (args: {
  isSpot: boolean;
  isSzInNtl: boolean;
  isBuyOrder: boolean;
  midPx: number;
  availableBalance: number;
}) => {
  const { isBuyOrder, isSpot, isSzInNtl, availableBalance, midPx } = args;
  if (isSpot) {
    if (isBuyOrder)
      return isSzInNtl ? availableBalance : availableBalance / midPx;
    return isSzInNtl ? availableBalance * midPx : availableBalance;
  }

  return isSzInNtl ? availableBalance * midPx : availableBalance;
};
