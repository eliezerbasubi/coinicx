import { useReducer } from "react";
import { toast } from "sonner";

import { OrderSide } from "@/types/trade";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import {
  useAvailableToTrade,
  useMaxTradeSz,
  useUserTradeStore,
} from "@/store/trade/user-trade";

import { useEnableTrading } from "./useEnableTrading";

type State = {
  limitPrice: string;
  size: string;
  szPercent: number;
};

const initialState: State = {
  limitPrice: "",
  size: "",
  szPercent: 0,
};

const toastId = "order-form";

export const useOrderForm = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { ...initialState },
  );

  const { shouldEnableTrading, enableTrading } = useEnableTrading({ toastId });

  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
  const szDecimals = useInstrumentStore((s) => s.assetMeta?.szDecimals || 0);
  const orderFormSettings = useTradeContext((s) => s.orderFormSettings);
  const orderSide = useTradeContext((s) => s.orderSide);

  const isBuyOrder = orderSide === "buy";

  const maxTradeSz = useMaxTradeSz(isBuyOrder);
  const availableToTrade = useAvailableToTrade(isBuyOrder);

  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);
  const setOrderSide = useTradeContext((s) => s.setOrderSide);

  const midPx = useInstrumentStore((s) => s.assetCtx?.midPx || 0);

  const availableBalance = isSpot ? availableToTrade : maxTradeSz;

  const orderSizeInBase = orderFormSettings.isSzInNtl
    ? parseFloat(state.size || "0") * midPx
    : parseFloat(state.size || "0");

  const onSizeCoinChange = (isNtl: boolean) => {
    const currentSize = parseFloat(state.size);
    const newSize = isNtl ? currentSize * midPx : currentSize / midPx;

    const fractionDigits = isNtl ? 2 : szDecimals;

    dispatch({ size: newSize.toFixed(fractionDigits) });
    setOrderFormSettings({ isSzInNtl: isNtl });
  };

  const onPercentChange = (percent: number) => {
    const maxOrderSize = getOrderMaxSize({
      isBuyOrder,
      isSpot,
      isSzInNtl: orderFormSettings.isSzInNtl,
      availableBalance,
      midPx,
    });

    const size = (maxOrderSize * percent) / 100;
    const fractionDigits = orderFormSettings.isSzInNtl ? 2 : szDecimals;

    dispatch({
      szPercent: percent,
      size: size.toFixed(fractionDigits),
    });
  };

  const onSizeChange = (size: string) => {
    const percent = (parseFloat(size || "0") / availableBalance) * 100;

    dispatch({ size, szPercent: Math.min(percent, 100) });
  };

  const onOrderSideChange = (orderSide: OrderSide) => {
    const isBuyOrder = orderSide === "buy";

    if (parseFloat(state.size)) {
      const availableBalance = useUserTradeStore
        .getState()
        .getOrderAvailableBalance({ isBuyOrder, isSpot });

      const maxOrderSize = getOrderMaxSize({
        isBuyOrder: orderSide === "buy",
        isSpot,
        isSzInNtl: orderFormSettings.isSzInNtl,
        availableBalance,
        midPx,
      });

      const percent = (parseFloat(state.size) / maxOrderSize) * 100;
      dispatch({ szPercent: Math.min(percent, 100) });
    }

    setOrderSide(orderSide);
  };

  const onMidClick = () => {
    dispatch({ limitPrice: midPx.toFixed(szDecimals) });
  };

  const onPlaceOrder = async () => {
    try {
      if (shouldEnableTrading) {
        return await enableTrading();
      }

      // Place order logic here
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order";

      toast.error(message, {
        id: toastId,
      });
    }
  };

  return {
    state,
    isBuyOrder,
    orderSide,
    orderSizeInBase,
    shouldEnableTrading,
    showLimitPrice: orderFormSettings.orderType === "limit",
    dispatch,
    onMidClick,
    onPercentChange,
    onSizeCoinChange,
    onSizeChange,
    onOrderSideChange,
    onPlaceOrder,
  };
};

const getOrderMaxSize = (args: {
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
