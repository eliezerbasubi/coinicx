import { useMemo } from "react";

import { OrderType } from "@/types/trade";
import {
  calculateMarginRequired,
  calculateOrderValue,
} from "@/features/trade/utils";
import {
  isLimitOrder,
  isScaleOrTwapOrder,
  isStopOrder,
} from "@/features/trade/utils/orderTypes";
import { isValidTwapMinutes } from "@/features/trade/utils/twap";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import {
  useAvailableToTrade,
  useMaxTradeSz,
  useShallowUserTradeStore,
} from "@/store/trade/user-trade";

export const useOrderForm = () => {
  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
  const { size, limitPrice, orderSide, settings, scaleOrder, twapOrder } =
    useShallowOrderFormStore((s) => ({
      size: s.size,
      limitPrice: s.limitPrice,
      orderSide: s.orderSide,
      settings: s.settings,
      scaleOrder: s.scaleOrder,
      twapOrder: s.twapOrder,
    }));

  const isBuyOrder = orderSide === "buy";

  const maxTradeSz = useMaxTradeSz(isBuyOrder);
  const availableToTrade = useAvailableToTrade(isBuyOrder);

  const midPx = useShallowInstrumentStore((s) => s.assetCtx?.midPx || 0);
  const leverage = useShallowUserTradeStore((s) => s.leverage?.value || 0);

  const availableBalance = isSpot ? availableToTrade : maxTradeSz;

  const orderSizeInBase = useOrderFormStore.getState().getSizeInBase(midPx);

  const isLimitOrderType = isLimitOrder(settings.orderType);

  const scaleOrderValue = useMemo(() => {
    if (scaleOrder.length === 0) return 0;
    return scaleOrder.reduce((acc, order) => acc + order.price * order.size, 0);
  }, [scaleOrder]);

  const orderValueAndMargin = calculateOrderValueAndMargin({
    orderType: settings.orderType,
    orderSize: orderSizeInBase,
    limitPx: parseFloat(limitPrice || "0"),
    midPx,
    leverage,
    isSpot,
    reduceOnly: settings.reduceOnly,
    scaleOrderValue,
  });

  const hasInsufficientMargin = checkInsufficientMargin({
    ...orderValueAndMargin,
    balance: availableBalance,
    isBuyOrder,
    isSpot,
    midPx,
    orderType: settings.orderType,
  });

  const disabled =
    !parseFloat(size) ||
    !availableBalance ||
    (isLimitOrderType && !parseFloat(limitPrice)) ||
    (settings.orderType === "twap" && !isValidTwapMinutes(twapOrder.minutes));

  return {
    disabled,
    isBuyOrder,
    orderSide,
    orderSizeInBase,
    orderType: settings.orderType,
    orderValueAndMargin,
    hasInsufficientMargin,
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

const calculateOrderValueAndMargin = (params: {
  orderType: OrderType;
  orderSize: number;
  limitPx: number;
  midPx: number;
  leverage: number;
  isSpot: boolean;
  reduceOnly: boolean;
  scaleOrderValue: number;
}) => {
  if (isScaleOrTwapOrder(params.orderType) && !params.scaleOrderValue) {
    return {
      orderValue: 0,
      marginRequired: 0,
    };
  }

  const orderValue =
    params.scaleOrderValue ||
    calculateOrderValue({
      orderType: params.orderType,
      orderSize: params.orderSize,
      limitPx: params.limitPx,
      midPx: params.midPx,
    });

  if (params.isSpot) {
    return {
      orderValue,
      marginRequired: 0,
    };
  }

  const marginRequired = calculateMarginRequired({
    orderValue,
    userLeverage: params.leverage,
    isReduceOnly: params.reduceOnly,
  });

  return {
    orderValue,
    marginRequired,
  };
};
