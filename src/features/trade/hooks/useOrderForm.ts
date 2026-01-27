import { useEffect, useReducer } from "react";

import { OrderSide } from "@/types/trade";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import {
  useAvailableToTrade,
  useMaxTradeSz,
  useUserTradeStore,
} from "@/store/trade/user-trade";

type State = {
  limitPrice: string;
  size: string;
  szPercent: number;
  orderSide: OrderSide;
};

const initialState: State = {
  limitPrice: "",
  size: "",
  szPercent: 0,
  orderSide: "buy",
};

export const useOrderForm = (args?: { side?: OrderSide }) => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { ...initialState, orderSide: args?.side || "buy" },
  );

  const isBuyOrder = state.orderSide === "buy";

  const maxTradeSz = useMaxTradeSz(isBuyOrder);
  const availableToTrade = useAvailableToTrade(isBuyOrder);
  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
  const szDecimals = useInstrumentStore((s) => s.assetMeta?.szDecimals || 0);
  const orderFormSettings = useTradeContext((s) => s.orderFormSettings);
  const base = useTradeContext((s) => s.base);

  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);

  // const markPx = useInstrumentStore((s) => s.assetCtx?.markPx || 0);
  const midPx = useInstrumentStore((s) => s.assetCtx?.midPx || 0);

  const availableBalance = isSpot ? availableToTrade : maxTradeSz;

  // TODO: Refactor this to pass a key to the OrderForm component so that state is reset when the base changes
  // This is a temporary fix
  useEffect(() => {
    return () => {
      dispatch({ limitPrice: "", size: "", szPercent: 0 });
    };
  }, [base]);

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
    const percent = (parseFloat(size) / availableBalance) * 100;

    dispatch({ size, szPercent: Math.min(percent, 100) });
  };

  const onOrderSideChange = (orderSide: OrderSide) => {
    const isBuyOrder = orderSide === "buy";
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

    dispatch({ orderSide, szPercent: Math.min(percent, 100) });
  };

  const onMidClick = () => {
    dispatch({ limitPrice: midPx.toFixed(szDecimals) });
  };

  return {
    state,
    isBuyOrder,
    showLimitPrice: orderFormSettings.orderType === "limit",
    dispatch,
    onMidClick,
    onPercentChange,
    onSizeCoinChange,
    onSizeChange,
    onOrderSideChange,
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
