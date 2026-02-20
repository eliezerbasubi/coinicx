import { useMemo, useReducer } from "react";

import { OrderSide, OrderType } from "@/types/trade";
import {
  calculateMarginRequired,
  calculateOrderValue,
} from "@/features/trade/utils";
import { isLimitOrder, isStopOrder } from "@/features/trade/utils/orderTypes";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useAvailableToTrade,
  useMaxTradeSz,
  useUserTradeStore,
} from "@/store/trade/user-trade";

type State = {
  limitPrice: string;
  triggerPrice: string;
  size: string;
  szPercent: number;
};

const initialState: State = {
  limitPrice: "",
  triggerPrice: "",
  size: "",
  szPercent: 0,
};

export const useOrderForm = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { ...initialState },
  );

  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
  const szDecimals = useShallowInstrumentStore(
    (s) => s.assetMeta?.szDecimals || 0,
  );
  const orderFormSettings = useTradeContext((s) => s.orderFormSettings);
  const orderSide = useTradeContext((s) => s.orderSide);

  const isBuyOrder = orderSide === "buy";

  const maxTradeSz = useMaxTradeSz(isBuyOrder);
  const availableToTrade = useAvailableToTrade(isBuyOrder);

  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);
  const setOrderSide = useTradeContext((s) => s.setOrderSide);

  const midPx = useShallowInstrumentStore((s) => s.assetCtx?.midPx || 0);

  const availableBalance = isSpot ? availableToTrade : maxTradeSz;

  const numSize = parseFloat(state.size || "0");
  const orderSizeInBase = orderFormSettings.isSzInNtl
    ? numSize / midPx
    : numSize;

  const isLimitOrderType = isLimitOrder(orderFormSettings.orderType);

  const orderValueAndMarginRequired = useMemo(() => {
    const leverage = useUserTradeStore.getState().leverage;

    const orderValue = calculateOrderValue({
      orderType: orderFormSettings.orderType,
      orderSize: orderSizeInBase,
      limitPx: parseFloat(state.limitPrice || "0"),
      midPx,
    });

    if (isSpot) {
      return {
        orderValue,
        marginRequired: 0,
      };
    }

    const marginRequired = calculateMarginRequired({
      orderValue,
      userLeverage: leverage?.value || 0,
      isReduceOnly: orderFormSettings.reduceOnly,
    });

    return {
      orderValue,
      marginRequired,
    };
  }, [
    isSpot,
    state.limitPrice,
    orderSizeInBase,
    midPx,
    orderFormSettings.orderType,
    orderFormSettings.isSzInNtl,
    orderFormSettings.reduceOnly,
  ]);

  const hasInsufficientMargin = checkInsufficientMargin({
    ...orderValueAndMarginRequired,
    balance: availableBalance,
    isBuyOrder,
    isSpot,
    midPx,
    orderType: orderFormSettings.orderType,
  });

  const maxOrderSize = getOrderMaxSize({
    isBuyOrder,
    isSpot,
    isSzInNtl: orderFormSettings.isSzInNtl,
    availableBalance,
    midPx,
  });

  const disabled =
    !numSize ||
    !availableBalance ||
    (isLimitOrderType && !parseFloat(state.limitPrice));

  const onSizeCoinChange = (isNtl: boolean) => {
    const currentSize = parseFloat(state.size);
    const newSize = isNtl ? currentSize * midPx : currentSize / midPx;

    const fractionDigits = isNtl ? 2 : szDecimals;

    dispatch({ size: newSize.toFixed(fractionDigits) });
    setOrderFormSettings({ isSzInNtl: isNtl });
  };

  const onPercentChange = (percent: number) => {
    const size = (maxOrderSize * percent) / 100;
    const fractionDigits = orderFormSettings.isSzInNtl ? 2 : szDecimals;

    dispatch({
      szPercent: percent,
      size: size.toFixed(fractionDigits),
    });
  };

  const onSizeChange = (size: string) => {
    const percent = Math.floor((parseFloat(size || "0") / maxOrderSize) * 100);

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

  return {
    state,
    disabled,
    isBuyOrder,
    orderSide,
    orderSizeInBase,
    orderType: orderFormSettings.orderType,
    orderValueAndMarginRequired,
    hasInsufficientMargin,
    dispatch,
    onMidClick,
    onPercentChange,
    onSizeCoinChange,
    onSizeChange,
    onOrderSideChange,
  };
};

const checkInsufficientMargin = (params: {
  balance: number;
  marginRequired: number;
  orderValue: number;
  midPx: number;
  orderType: OrderType;
  isSpot: boolean;
  isBuyOrder: boolean;
}) => {
  let availableBalance = params.balance * params.midPx;

  if (params.isSpot) {
    availableBalance = params.isBuyOrder
      ? params.balance
      : params.balance * params.midPx;
  }

  const margin = params.isSpot ? params.orderValue : params.marginRequired;

  const hasInsufficientMargin =
    margin > availableBalance && !isStopOrder(params.orderType);

  return hasInsufficientMargin;
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
