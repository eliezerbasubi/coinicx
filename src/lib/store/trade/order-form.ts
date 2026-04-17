import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { OrderSide, OrderType, ScaleDistribution } from "@/lib/types/trade";
import { roundToDecimals } from "@/features/trade/utils";

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
  onSizeCoinChange: (params: {
    isNtl: boolean;
    midPx: number;
    szDecimals: number;
  }) => void;
  onPercentChange: (params: {
    percent: number;
    isSpot: boolean;
    szDecimals: number;
  }) => void;
  onSizeChange: (params: { size: string; isSpot: boolean }) => void;
  onOrderSideChange: (orderSide: OrderSide, isSpot: boolean) => void;
  onMidClick: (midPx: number) => void;
  getSizeInBase: (midPx: number) => number;
  reset: () => void;
  calculateOrderSize: (args: {
    isSpot: boolean;
    isBuyOrder?: boolean;
  }) => number;
};

type OrderFormStore = OrderFormState & OrderFormActions;

const initialState: OrderFormState = {
  orderSide: "buy",
  predictSideIndex: 0, // 0 for yes, 1 for no
  size: "",
  szPercent: 0,
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
        set((state) => ({ ...state, ...data }));
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

        const maxOrderSize = calculateMaxOrderSize({
          isBuyOrder: isBuy,
          isSpot,
          isSzInNtl: settings.isSzInNtl,
          availableBalance,
          midPx,
        });

        return maxOrderSize;
      },
      onSizeCoinChange(params) {
        const { size, settings } = get();

        let currentSize = size;

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
        }

        set({
          size: currentSize,
          settings: { ...settings, isSzInNtl: params.isNtl },
        });
      },
      onPercentChange(params) {
        const { orderSide, settings, calculateOrderSize } = get();

        const maxOrderSize = calculateOrderSize({
          isSpot: params.isSpot,
          isBuyOrder: orderSide === "buy",
        });

        const size = (maxOrderSize * params.percent) / 100;
        const fractionDigits = settings.isSzInNtl ? 2 : params.szDecimals;

        set({
          szPercent: params.percent,
          size: roundToDecimals(size, fractionDigits, "floor").toString(),
        });
      },

      onSizeChange(params) {
        const { orderSide, calculateOrderSize } = get();

        const maxOrderSize = calculateOrderSize({
          isSpot: params.isSpot,
          isBuyOrder: orderSide === "buy",
        });

        const maxOrderSizeValue = maxOrderSize || 1;

        const percent = Math.floor(
          (parseFloat(params.size || "0") / maxOrderSizeValue) * 100,
        );

        set({ size: params.size, szPercent: Math.min(percent, 100) });
      },

      onOrderSideChange(orderSide: OrderSide, isSpot: boolean) {
        const { size, calculateOrderSize } = get();

        const isBuyOrder = orderSide === "buy";

        if (parseFloat(size)) {
          const maxOrderSize = calculateOrderSize({ isSpot, isBuyOrder });

          const maxOrderSizeValue = maxOrderSize || 1;

          const percent = (parseFloat(size) / maxOrderSizeValue) * 100;
          set({ szPercent: Math.min(percent, 100) });
        }

        set({ orderSide });
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

const getInstrumentData = () => {
  const { assetCtx, assetMeta } = useInstrumentStore.getState();
  return {
    midPx: assetCtx?.midPx || 0,
    szDecimals: assetMeta?.szDecimals || 0,
  };
};

const calculateMaxOrderSize = (args: {
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
