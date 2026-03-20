import { OrderParameters } from "@nktkas/hyperliquid";

import { HLOrder, Order } from "@/lib/types/trade";

export function buildOrder(order: Order): HLOrder {
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
