import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { OrderSide, OrderType, ScaleDistribution } from "@/lib/types/trade";
import { roundToDecimals } from "@/features/trade/utils";

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
  szPercent: number;
  settings: OrderFormSettings;
  tpslState: TPSLState;
  scaleDistribution: ScaleDistribution;
  scaleOrder: ScaleOrder[];
  scaleTotalSize: number;
  twapOrder: TwapOrder;
} & ExecutionOrder;

type OrderFormActions = {
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
  calculateOrderSize: (args: {
    isSpot: boolean;
    isBuyOrder?: boolean;
    midPx: number;
  }) => number;
};

type OrderFormStore = OrderFormState & OrderFormActions;

const initialState: OrderFormState = {
  orderSide: "buy",
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
        const parsedSize = parseFloat(size || "0");
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
      calculateOrderSize(params) {
        const { orderSide, settings } = get();

        const isBuy = params.isBuyOrder ?? orderSide === "buy";

        const availableBalance = useUserTradeStore
          .getState()
          .getOrderAvailableBalance({
            isBuyOrder: isBuy,
            isSpot: params.isSpot,
          });

        const maxOrderSize = calculateOrderSize({
          isBuyOrder: isBuy,
          isSpot: params.isSpot,
          isSzInNtl: settings.isSzInNtl,
          availableBalance,
          midPx: params.midPx,
        });

        return maxOrderSize;
      },
      onSizeCoinChange(params) {
        const { size, settings, handleScaleTotalSize } = get();
        const { midPx, szDecimals, isNtl } = params;

        let currentSize = size;

        if (currentSize) {
          const parsedSize = parseFloat(currentSize);
          const newSize = isNtl ? parsedSize * midPx : parsedSize / midPx;

          const fractionDigits = isNtl ? 2 : szDecimals;

          currentSize = roundToDecimals(
            newSize,
            fractionDigits,
            "floor",
          ).toString();

          handleScaleTotalSize({ midPx });
        }

        set({
          size: currentSize,
          settings: { ...settings, isSzInNtl: isNtl },
        });
      },
      onPercentChange(params) {
        const {
          orderSide,
          settings,
          calculateOrderSize,
          handleScaleTotalSize,
        } = get();
        const { szDecimals, isSpot, percent, midPx } = params;

        const maxOrderSize = calculateOrderSize({
          isSpot,
          isBuyOrder: orderSide === "buy",
          midPx,
        });

        const size = (maxOrderSize * percent) / 100;
        const fractionDigits = settings.isSzInNtl ? 2 : szDecimals;

        handleScaleTotalSize({ midPx });

        set({
          szPercent: percent,
          size: roundToDecimals(size, fractionDigits, "floor").toString(),
        });
      },

      onSizeChange(params) {
        const { orderSide, calculateOrderSize, handleScaleTotalSize } = get();

        const maxOrderSize = calculateOrderSize({
          isSpot: params.isSpot,
          isBuyOrder: orderSide === "buy",
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
        const { size, calculateOrderSize } = get();

        const isBuyOrder = params.orderSide === "buy";

        if (parseFloat(size) && params.midPx) {
          const maxOrderSize = calculateOrderSize({
            isSpot: params.isSpot,
            isBuyOrder,
            midPx: params.midPx,
          });

          const maxOrderSizeValue = maxOrderSize || 1;

          const percent = (parseFloat(size) / maxOrderSizeValue) * 100;
          set({ szPercent: Math.min(percent, 100) });
        }

        set({ orderSide: params.orderSide });
      },

      onMidClick(midPx) {
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
