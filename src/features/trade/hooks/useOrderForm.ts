import { useMemo } from "react";

import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { OrderType } from "@/lib/types/trade";
import {
  useAvailableToTrade,
  useMaxTradeSz,
} from "@/hooks/useAvailableToTrade";
import { calculateMarginRequired } from "@/features/trade/utils";
import {
  isLimitOrder,
  isScaleOrTwapOrder,
  isStopOrder,
} from "@/features/trade/utils/orderTypes";
import { calculateOrderValue } from "@/features/trade/utils/shared";
import { isValidTwapMinutes } from "@/features/trade/utils/twap";

type UseOrderFormArgs = {
  referencePx: number;
  szDecimals: number;
  spotAsset?: {
    base: string;
    quote: string;
  };
};

export const useOrderForm = ({
  referencePx,
  szDecimals,
  spotAsset,
}: UseOrderFormArgs) => {
  const {
    size,
    limitPrice,
    orderSide,
    settings,
    scaleOrder,
    twapOrder,
    getSizeInBase,
  } = useShallowOrderFormStore((s) => ({
    size: s.size,
    limitPrice: s.limitPrice,
    orderSide: s.orderSide,
    settings: s.settings,
    scaleOrder: s.scaleOrder,
    twapOrder: s.twapOrder,
    getSizeInBase: s.getSizeInBase,
  }));

  const isBuyOrder = orderSide === "buy";
  const isSpot = !!spotAsset;

  const maxTradeSz = useMaxTradeSz(isBuyOrder);
  const availableToTrade = useAvailableToTrade({
    isBuyOrder,
    spotAsset,
  });

  const leverage = useShallowUserTradeStore(
    (s) => s.activeAssetData?.leverage?.value || 0,
  );

  const availableBalance = isSpot ? availableToTrade : maxTradeSz;

  const isLimitOrderType = isLimitOrder(settings.orderType);

  const scaleOrderValue = useMemo(() => {
    if (scaleOrder.length === 0) return 0;
    return scaleOrder.reduce((acc, order) => acc + order.price * order.size, 0);
  }, [scaleOrder]);

  const orderValueAndMargin = calculateOrderValueAndMargin({
    orderType: settings.orderType,
    orderSize: parseFloat(size),
    limitPx: parseFloat(limitPrice || "0"),
    referencePx,
    leverage,
    isSpot,
    reduceOnly: settings.reduceOnly,
    scaleOrderValue,
    isSzInNtl: settings.isSzInNtl,
    szDecimals,
  });

  const hasInsufficientMargin = checkInsufficientMargin({
    ...orderValueAndMargin,
    balance: availableBalance,
    isBuyOrder,
    isSpot,
    referencePx,
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
    orderSizeInBase: getSizeInBase(referencePx),
    orderType: settings.orderType,
    orderValueAndMargin,
    hasInsufficientMargin,
  };
};

const checkInsufficientMargin = (params: {
  balance: number;
  marginRequired: number;
  orderValue: number;
  referencePx: number;
  orderType: OrderType;
  isSpot: boolean;
  isBuyOrder: boolean;
}) => {
  let availableBalance = params.balance * params.referencePx;

  if (params.isSpot) {
    availableBalance = params.isBuyOrder
      ? params.balance
      : params.balance * params.referencePx;
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
  referencePx: number;
  leverage: number;
  isSpot: boolean;
  isSzInNtl: boolean;
  reduceOnly: boolean;
  scaleOrderValue: number;
  szDecimals: number;
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
      referencePx: params.referencePx,
      szDecimals: params.szDecimals,
      isSzInNtl: params.isSzInNtl,
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
