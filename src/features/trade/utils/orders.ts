import { OrderParameters } from "@nktkas/hyperliquid";

import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { HLOrder, OrderSide, OrderType, TimeInForce } from "@/lib/types/trade";

import { formatSize } from "./formatting";
import {
  calculateSlippageAdjustedPrice,
  getPriceDecimals,
  roundToDecimals,
} from "./prices";

type OrderParams = {
  referencePx: number;
  szDecimals: number;
  isSpot: boolean;
  assetId: number;

  /** Whether the size is in notional and hence should be converted to base size */
  isSzInNtl?: boolean;
};

type BuildOrderParams = {
  assetId: number;
  side: OrderSide;
  type: OrderType | "stopLoss" | "takeProfit";
  price: string | number;
  size: string;
  reduceOnly?: boolean;
  timeInForce?: TimeInForce;
  triggerPrice?: string;
  isMarket?: boolean;
  clientOrderId?: string;
};

export function buildOrder(order: BuildOrderParams): HLOrder {
  let orderTypePayload: HLOrder["t"] = { limit: { tif: "Gtc" } };

  const isStopOrder =
    order.type === "stopLoss" ||
    order.type === "stopLimit" ||
    order.type === "stopMarket";

  if (order.type === "limit") {
    const tif = order.timeInForce || "Gtc";

    orderTypePayload = {
      limit: { tif },
    };
  } else if (order.type === "market") {
    orderTypePayload = {
      limit: {
        tif: "FrontendMarket",
      },
    };
  } else if (isStopOrder || order.type === "takeProfit") {
    if (!order.triggerPrice) {
      throw new Error("Trigger price is required for stop orders");
    }
    orderTypePayload = {
      trigger: {
        isMarket: Boolean(order.isMarket),
        triggerPx: order.triggerPrice,
        tpsl: isStopOrder ? "sl" : "tp",
      },
    };
  }

  const payload: OrderParameters["orders"][number] = {
    a: order.assetId,
    b: order.side === "buy",
    p: order.price,
    s: order.size,
    r: order.reduceOnly || false,
    t: orderTypePayload,
  };

  if (order.clientOrderId) {
    payload.c = order.clientOrderId;
  }

  return payload;
}

const buildExchangeOrder = (
  params: {
    size: string;
    entryPrice?: string;
    type: BuildOrderParams["type"];
    isMarket?: boolean;
    reduceOnly?: boolean;
    triggerPrice?: string;
    orderSide?: OrderSide;
  } & OrderParams,
) => {
  const { settings, orderSide } = useOrderFormStore.getState();

  const size = parseFloat(params.size);

  const isNtl = params.isSzInNtl ?? settings.isSzInNtl;

  const price = params.entryPrice
    ? parseFloat(params.entryPrice)
    : params.referencePx;

  const sizeInBase = isNtl ? size / price : size;

  // Convert size to notional if it's in base
  const minOrderValue = roundToDecimals(
    isNtl ? size : size * price,
    params.szDecimals,
    "floor",
  );

  if (minOrderValue < 10) {
    throw new Error("Order must have a minimum value of 10 USD");
  }

  const decimals = getPriceDecimals(price, params.szDecimals, params.isSpot);

  return buildOrder({
    assetId: params.assetId,
    side: params.orderSide ?? orderSide,
    type: params.type,
    price: roundToDecimals(price, Number(decimals), "floor").toString(),
    size: formatSize(sizeInBase, params.szDecimals),
    reduceOnly: params.reduceOnly ?? settings.reduceOnly,
    timeInForce:
      settings.orderType === "limit"
        ? (settings.timeInForce as BuildOrderParams["timeInForce"])
        : undefined,
    isMarket: params.isMarket,
    triggerPrice: params.triggerPrice,
  });
};

/**
 * Builds take profit and stop loss orders.
 */
export const buildTpSlOrders = (
  params: {
    size: string;
  } & OrderParams,
) => {
  const { settings, orderSide, tpslState } = useOrderFormStore.getState();

  const isBuyOrder = orderSide === "buy";
  const tspslOrders = [];

  // Toggle order side
  const tpslOrderSide = isBuyOrder ? "sell" : "buy";

  if (tpslState.tpPrice) {
    const tpPrice = parseFloat(tpslState.tpPrice);

    const entryPrice =
      settings.orderType === "market"
        ? calculateSlippageAdjustedPrice({
            entryPrice: tpPrice,
            isBuyOrder: tpslOrderSide === "buy",
          })
        : tpPrice;

    tspslOrders.push(
      buildExchangeOrder({
        reduceOnly: true,
        referencePx: params.referencePx,
        szDecimals: params.szDecimals,
        isSpot: params.isSpot,
        assetId: params.assetId,
        orderSide: tpslOrderSide,
        size: params.size,
        entryPrice: entryPrice.toString(),
        triggerPrice: tpPrice.toString(),
        type: "takeProfit",
      }),
    );
  }

  if (tpslState.slPrice) {
    const slPrice = parseFloat(tpslState.slPrice);

    const entryPrice =
      settings.orderType === "market"
        ? calculateSlippageAdjustedPrice({
            entryPrice: slPrice,
            isBuyOrder: tpslOrderSide === "buy",
          })
        : slPrice;

    tspslOrders.push(
      buildExchangeOrder({
        reduceOnly: true,
        referencePx: params.referencePx,
        szDecimals: params.szDecimals,
        isSpot: params.isSpot,
        assetId: params.assetId,
        orderSide: tpslOrderSide,
        size: params.size,
        entryPrice: entryPrice.toString(),
        triggerPrice: slPrice.toString(),
        type: "stopLoss",
      }),
    );
  }

  return tspslOrders;
};

/**
 * Builds a market order.
 */
export const buildMarketOrder = (params: OrderParams) => {
  const formValues = useOrderFormStore.getState();

  const entryPrice = calculateSlippageAdjustedPrice({
    entryPrice: params.referencePx,
    isBuyOrder: formValues.orderSide === "buy",
  });

  const order = buildExchangeOrder({
    size: formValues.size,
    entryPrice: entryPrice.toString(),
    referencePx: params.referencePx,
    szDecimals: params.szDecimals,
    isSpot: params.isSpot,
    assetId: params.assetId,
    isSzInNtl: params.isSzInNtl,
    type: "market",
    isMarket: true,
  });

  const tspslOrders = buildTpSlOrders({
    size: formValues.size,
    referencePx: params.referencePx,
    szDecimals: params.szDecimals,
    isSpot: params.isSpot,
    assetId: params.assetId,
  });

  return {
    orders: [order, ...tspslOrders],
    grouping: tspslOrders.length ? "normalTpsl" : "na",
  };
};

/**
 * Builds a limit order.
 */
export const buildLimitOrder = (params: OrderParams) => {
  const formValues = useOrderFormStore.getState();

  const order = buildExchangeOrder({
    size: formValues.size,
    entryPrice: formValues.limitPrice,
    referencePx: params.referencePx,
    szDecimals: params.szDecimals,
    isSpot: params.isSpot,
    assetId: params.assetId,
    isSzInNtl: params.isSzInNtl,
    type: "limit",
    isMarket: false,
  });

  const tspslOrders = buildTpSlOrders({
    size: formValues.size,
    referencePx: params.referencePx,
    szDecimals: params.szDecimals,
    isSpot: params.isSpot,
    assetId: params.assetId,
  });

  return {
    orders: [order, ...tspslOrders],
    grouping: tspslOrders.length ? "normalTpsl" : "na",
  };
};

/**
 * Builds stop orders.
 */
export const buildStopOrders = (params: OrderParams & { midPx: number }) => {
  const { settings, orderSide, ...formValues } = useOrderFormStore.getState();

  const triggerPrice = formValues.triggerPrice;
  const trigger = parseFloat(triggerPrice);
  const isBuyOrder = orderSide === "buy";

  if (
    (isBuyOrder && trigger < params.midPx) ||
    (!isBuyOrder && trigger > params.midPx)
  ) {
    throw new Error(
      `Stop price must be ${isBuyOrder ? "above" : "below"} the current price`,
    );
  }
  const isMarket = settings.orderType === "stopMarket";
  const entryPrice = isMarket
    ? calculateSlippageAdjustedPrice({
        entryPrice: trigger,
        isBuyOrder,
      })
    : trigger;

  const order = buildExchangeOrder({
    size: formValues.size,
    referencePx: params.referencePx,
    szDecimals: params.szDecimals,
    isSpot: params.isSpot,
    assetId: params.assetId,
    isSzInNtl: params.isSzInNtl,
    entryPrice: entryPrice.toString(),
    type: settings.orderType,
    isMarket,
    triggerPrice,
  });

  return {
    orders: [order],
    grouping: "na",
  };
};

/**
 * Builds scale orders.
 */
export const buildScaleOrders = (params: OrderParams) => {
  const { scaleOrder } = useOrderFormStore.getState();

  if (!scaleOrder.length) {
    return {
      orders: [],
      grouping: "na",
    };
  }

  const hasSmallestOrder = scaleOrder.some(
    (order) => order.price * order.size < 10,
  );

  if (hasSmallestOrder) {
    throw new Error("Smallest order must have a minimum value of 10 USD");
  }

  const orders = scaleOrder.map((order) => {
    return buildExchangeOrder({
      size: order.size.toString(),
      referencePx: params.referencePx,
      szDecimals: params.szDecimals,
      isSpot: params.isSpot,
      assetId: params.assetId,
      isSzInNtl: params.isSzInNtl,
      entryPrice: order.price.toString(),
      type: "limit",
      isMarket: false,
    });
  });

  return {
    orders,
    grouping: "na",
  };
};
