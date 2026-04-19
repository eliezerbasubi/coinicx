import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { OrderSide, OrderType, ScaleDistribution } from "@/lib/types/trade";
import { roundToDecimals } from "@/features/trade/utils";
import { calculateMaxTradeSize } from "@/features/trade/utils/shared";

import { useUserTradeStore } from "./user-trade";

type OrderFormSettings = {
  isSzInNtl: boolean;
  orderType: OrderType;
  showTpSl: boolean;
  reduceOnly: boolean;
  timeInForce: string;
  maxSlippage?: number;
};

type ExecutionOrder = {
  size: string;
  limitPrice: string;
  triggerPrice: string;
};

type ScaleOrder = {
  price: number;
  size: number;
};

type TPSLState = {
  tpPrice: string;
  slPrice: string;
};

type TwapOrder = {
  minutes: number;
  randomize: boolean;
};

type OrderFormState = {
  orderSide: OrderSide;
  predictSideIndex: number;
  szPercent: number;
  settings: OrderFormSettings;
  tpslState: TPSLState;
  scaleDistribution: ScaleDistribution;
  scaleOrder: ScaleOrder[];
  scaleTotalSize: number;
  twapOrder: TwapOrder;
} & ExecutionOrder;

type OrderFormActions = {
  setPredictSideIndex: (index: number) => void;
  setOrderSide: (orderSide: OrderSide) => void;
  setSettings: (settings: Partial<OrderFormSettings>) => void;
  setTpslState: (data: Partial<TPSLState>) => void;
  setExecutionOrder: (data: Partial<ExecutionOrder>) => void;
  setScaleDistribution: (value: ScaleDistribution) => void;
  setScaleOrder: (value: ScaleOrder[]) => void;
  setTwapOrder: (value: Partial<TwapOrder>) => void;
  handleScaleTotalSize: (params: { midPx: number }) => void;
  onSizeCoinChange: (params: {
    isNtl: boolean;
    isSpot: boolean;
    midPx: number;
    szDecimals: number;
  }) => void;
  onPercentChange: (params: {
    percent: number;
    isSpot: boolean;
    szDecimals: number;
    midPx: number;
  }) => void;
  onSizeChange: (params: {
    size: string;
    isSpot: boolean;
    midPx: number;
  }) => void;
  onOrderSideChange: (params: {
    orderSide: OrderSide;
    isSpot: boolean;
    midPx?: number;
  }) => void;
  onMidClick: (midPx: number) => void;
  getSizeInBase: (midPx: number) => number;
  reset: () => void;
};

type OrderFormStore = OrderFormState & OrderFormActions;

const initialState: OrderFormState = {
  orderSide: "buy",
  predictSideIndex: 0, // 0 for yes, 1 for no
  size: "",
  szPercent: 0,
  scaleTotalSize: 0,
  limitPrice: "",
  triggerPrice: "",
  tpslState: {
    tpPrice: "",
    slPrice: "",
  },
  settings: {
    isSzInNtl: true,
    orderType: "market",
    showTpSl: false,
    reduceOnly: false,
    timeInForce: "Gtc",
  },
  twapOrder: {
    minutes: 1,
    randomize: false,
  },
  scaleDistribution: "equal",
  scaleOrder: [],
};

export const useOrderFormStore = create<OrderFormStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setOrderSide: (orderSide) => set({ orderSide }),
      setScaleOrder: (scaleOrder) => set({ scaleOrder }),
      setPredictSideIndex: (index) => set({ predictSideIndex: index }),
      setTpslState(data) {
        set((state) => ({ tpslState: { ...state.tpslState, ...data } }));
      },
      setScaleDistribution(value) {
        set((state) => ({ ...state, scaleDistribution: value }));
      },
      setExecutionOrder(data) {
        set((state) => ({ ...state, ...data }));
      },
      getSizeInBase(midPx) {
        const { size, settings } = get();

        if (!size) return 0;

        const parsedSize = parseFloat(size);

        return settings.isSzInNtl ? parsedSize / midPx : parsedSize;
      },
      setSettings(settings) {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      setTwapOrder(value) {
        set((state) => ({
          ...state,
          twapOrder: { ...state.twapOrder, ...value },
        }));
      },
      handleScaleTotalSize: (params) => {
        const { settings, getSizeInBase } = get();

        if (settings.orderType === "scale") {
          const totalSize = getSizeInBase(params.midPx);

          set({ scaleTotalSize: totalSize });
        }
      },
      onSizeCoinChange(params) {
        const { size, orderSide, settings, handleScaleTotalSize } = get();

        let currentSize = size;
        let currentSzPercent = 0;

        if (currentSize) {
          const parsedSize = parseFloat(currentSize);
          const newSize = params.isNtl
            ? parsedSize * params.midPx
            : parsedSize / params.midPx;

          const fractionDigits = params.isNtl ? 2 : params.szDecimals;

          currentSize = roundToDecimals(
            newSize,
            fractionDigits,
            "floor",
          ).toString();

          const maxOrderSize = calculateMaxOrderSize({
            isSpot: params.isSpot,
            isBuyOrder: orderSide === "buy",
            isSzInNtl: params.isNtl,
            midPx: params.midPx,
          });

          const maxOrderSizeValue = maxOrderSize || 1;

          currentSzPercent = Math.floor((newSize / maxOrderSizeValue) * 100);
          handleScaleTotalSize({ midPx: params.midPx });
        }

        set({
          size: currentSize,
          szPercent: currentSzPercent,
          settings: { ...settings, isSzInNtl: params.isNtl },
        });
      },
      onPercentChange(params) {
        const { orderSide, settings, handleScaleTotalSize } = get();
        const { szDecimals, isSpot, percent, midPx } = params;

        const maxOrderSize = calculateMaxOrderSize({
          isSpot: params.isSpot,
          isBuyOrder: orderSide === "buy",
          isSzInNtl: settings.isSzInNtl,
          midPx: params.midPx,
        });

        const size = (maxOrderSize * params.percent) / 100;
        const fractionDigits = settings.isSzInNtl ? 2 : params.szDecimals;

        handleScaleTotalSize({ midPx });

        set({
          szPercent: params.percent,
          size: roundToDecimals(size, fractionDigits, "floor").toString(),
        });
      },

      onSizeChange(params) {
        const { orderSide, settings, handleScaleTotalSize } = get();

        const maxOrderSize = calculateMaxOrderSize({
          isSpot: params.isSpot,
          isBuyOrder: orderSide === "buy",
          isSzInNtl: settings.isSzInNtl,
          midPx: params.midPx,
        });

        const maxOrderSizeValue = maxOrderSize || 1;

        const percent = Math.floor(
          (parseFloat(params.size || "0") / maxOrderSizeValue) * 100,
        );

        handleScaleTotalSize({ midPx: params.midPx });

        set({ size: params.size, szPercent: Math.min(percent, 100) });
      },

      onOrderSideChange(params) {
        const { size, settings } = get();

        const isBuyOrder = params.orderSide === "buy";

        // Recalculate szPercent if size is not empty
        if (parseFloat(size) && params.midPx) {
          const maxOrderSize = calculateMaxOrderSize({
            isSpot: params.isSpot,
            isBuyOrder,
            isSzInNtl: settings.isSzInNtl,
            midPx: params.midPx,
          });

          const maxOrderSizeValue = maxOrderSize || 1;

          const percent = Math.floor(
            (parseFloat(size) / maxOrderSizeValue) * 100,
          );
          set({ szPercent: Math.min(percent, 100) });
        }

        set({ orderSide: params.orderSide });
      },

      onMidClick(midPx: number) {
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
        scaleDistribution: state.scaleDistribution,
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

const calculateMaxOrderSize = (params: {
  isSpot: boolean;
  isSzInNtl: boolean;
  isBuyOrder: boolean;
  midPx: number;
}) => {
  const { isBuyOrder, isSpot, isSzInNtl, midPx } = params;

  const availableBalance = useUserTradeStore
    .getState()
    .getOrderAvailableBalance({
      isBuyOrder,
      isSpot,
    });

  return calculateMaxTradeSize({
    isSpot,
    isSzInNtl,
    isBuyOrder,
    midPx,
    availableBalance,
  });
};
