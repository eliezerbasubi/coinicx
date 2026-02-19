import { useState } from "react";
import { OrderParameters } from "@nktkas/hyperliquid";
import { toast } from "sonner";

import { Order } from "@/types/trade";
import {
  calculateSlippageAdjustedPrice,
  parseOrderPrice,
  removeTrailingZeros,
} from "@/features/trade/utils";
import { buildOrder } from "@/features/trade/utils/orders";
import { isStopOrder } from "@/features/trade/utils/orderTypes";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { toParseableNumber } from "@/utils/formatting/normalize-input-number";
import { formatNumber } from "@/utils/formatting/numbers";

import { useApproveBuilderFee } from "./useApproveBuilderFee";
import { useEnableTrading } from "./useEnableTrading";

const toastId = "place-order";

export const usePlaceOrder = () => {
  const { shouldEnableTrading, enableTrading } = useEnableTrading({ toastId });
  const { builder, approveBuilderFee } = useApproveBuilderFee();

  const orderFormSettings = useTradeContext((s) => s.orderFormSettings);
  const orderSide = useTradeContext((s) => s.orderSide);

  const isBuyOrder = orderSide === "buy";

  const [processing, setProcessing] = useState(false);

  const buildExchangeOrder = (params: {
    size: string;
    entryPrice?: string;
    type: Order["type"];
    isMarket?: boolean;
    triggerPrice?: string;
  }) => {
    const assetMeta = useInstrumentStore.getState().assetMeta;
    const assetCtx = useInstrumentStore.getState().assetCtx;

    if (!assetMeta || !assetCtx) {
      throw new Error("Asset metadata is not available");
    }

    const midPx = assetCtx.midPx;
    const markPx = assetCtx.markPx;
    const szDecimals = assetMeta.szDecimals;

    const size = parseFloat(params.size);

    const sizeInBase = orderFormSettings.isSzInNtl ? size * midPx : size;

    const price = params.entryPrice ? parseFloat(params.entryPrice) : markPx;

    return buildOrder({
      assetId: assetMeta.assetId,
      side: orderSide,
      type: params.type,
      price: parseOrderPrice(price, szDecimals),
      size: removeTrailingZeros(sizeInBase.toString()),
      reduceOnly: orderFormSettings.reduceOnly,
      timeInForce:
        orderFormSettings.orderType === "limit"
          ? (orderFormSettings.timeInForce as Order["timeInForce"])
          : undefined,
      isMarket: params.isMarket,
      triggerPrice: params.triggerPrice,
    });
  };

  const buildTpSlOrders = (params: {
    size: string;
    tpPrice: string;
    slPrice: string;
  }) => {
    const tspslOrders = [];

    if (params.tpPrice) {
      tspslOrders.push(
        buildExchangeOrder({
          size: params.size,
          entryPrice: params.tpPrice,
          type: "takeProfit",
        }),
      );
    }

    if (params.slPrice) {
      tspslOrders.push(
        buildExchangeOrder({
          size: params.size,
          entryPrice: params.slPrice,
          type: "stopLoss",
        }),
      );
    }

    return tspslOrders;
  };

  const buildMarketOrder = (params: {
    size: string;
    tpPrice?: string;
    slPrice?: string;
    isBuyOrder: boolean;
  }) => {
    const size = params.size;
    const markPx = useInstrumentStore.getState().assetCtx?.markPx ?? 0;

    const entryPrice = calculateSlippageAdjustedPrice({
      entryPrice: markPx,
      isLong: params.isBuyOrder,
    });

    const order = buildExchangeOrder({
      size,
      entryPrice: entryPrice.toString(),
      type: "market",
      isMarket: true,
    });

    const tspslOrders = buildTpSlOrders({
      size,
      tpPrice: params.tpPrice || "",
      slPrice: params.slPrice || "",
    });

    return {
      orders: [order, ...tspslOrders],
      grouping: tspslOrders.length ? "normalTpsl" : "na",
    };
  };

  const buildLimitOrder = (params: {
    size: string;
    limitPrice: string;
    tpPrice?: string;
    slPrice?: string;
    isBuyOrder: boolean;
  }) => {
    const size = params.size;

    const entryPrice = calculateSlippageAdjustedPrice({
      entryPrice: parseFloat(params.limitPrice),
      isLong: params.isBuyOrder,
    });

    const order = buildExchangeOrder({
      size,
      entryPrice: entryPrice.toString(),
      type: "limit",
      isMarket: false,
    });

    const tspslOrders = buildTpSlOrders({
      size,
      tpPrice: params.tpPrice || "",
      slPrice: params.slPrice || "",
    });

    return {
      orders: [order, ...tspslOrders],
      grouping: tspslOrders.length ? "normalTpsl" : "na",
    };
  };

  const buildStopOrders = (params: {
    size: string;
    isBuyOrder: boolean;
    triggerPrice: string;
  }) => {
    const size = params.size;
    const midPx = useInstrumentStore.getState().assetCtx?.midPx ?? 0;
    const trigger = parseFloat(params.triggerPrice);

    if (
      (params.isBuyOrder && trigger < midPx) ||
      (!params.isBuyOrder && trigger > midPx)
    ) {
      throw new Error(
        `Stop price must be ${params.isBuyOrder ? "above" : "below"} the current price`,
      );
    }

    const order = buildExchangeOrder({
      size,
      entryPrice: params.triggerPrice,
      type: orderFormSettings.orderType,
      isMarket: orderFormSettings.orderType === "stopMarket",
      triggerPrice: params.triggerPrice,
    });

    return {
      orders: [order],
      grouping: "na",
    };
  };

  const getExchangeOrders = (e: React.FormEvent<HTMLFormElement>) => {
    const assetMeta = useInstrumentStore.getState().assetMeta;
    const assetCtx = useInstrumentStore.getState().assetCtx;

    if (!assetMeta || !assetCtx) {
      throw new Error("Asset metadata is not available");
    }

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    let orderPayload = {
      orders: [] as OrderParameters["orders"],
      grouping: "na",
    };

    const size = toParseableNumber(formValues.size);

    switch (orderFormSettings.orderType) {
      case "market":
        orderPayload = buildMarketOrder({
          size,
          tpPrice: toParseableNumber(formValues.tpPrice),
          slPrice: toParseableNumber(formValues.slPrice),
          isBuyOrder,
        });
        break;
      case "limit":
        orderPayload = buildLimitOrder({
          size,
          limitPrice: toParseableNumber(formValues.limitPrice),
          tpPrice: toParseableNumber(formValues.tpPrice),
          slPrice: toParseableNumber(formValues.slPrice),
          isBuyOrder,
        });
        break;
      case "stopMarket":
      case "stopLimit":
        orderPayload = buildStopOrders({
          size,
          isBuyOrder,
          triggerPrice: toParseableNumber(formValues.triggerPrice),
        });
        break;
      default:
        throw new Error("Unsupported order type");
    }

    if (orderPayload.orders.length === 0) {
      throw new Error("No orders to place");
    }
    return orderPayload;
  };

  const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      const orderPayload = getExchangeOrders(e);

      setProcessing(true);

      toast.loading("Submitting order", {
        id: toastId,
      });

      // Ensure the user has approved the builder fee before placing the order
      await approveBuilderFee();

      const exchClient = await enableTrading();

      const { response } = await exchClient.order({
        orders: orderPayload.orders,
        grouping: orderPayload.grouping as OrderParameters["grouping"],
        builder,
      });

      const base = useInstrumentStore.getState().assetMeta?.base;

      let message = "Order submitted successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "object") {
          if ("filled" in status) {
            const filled = status.filled;
            message = `${filled.totalSz} ${base} ${isBuyOrder ? "bought" : "sold"} at ${formatNumber(Number(filled.avgPx), { style: "currency" })} avg. price`;
          }
          if ("resting" in status) {
            if (isStopOrder(orderFormSettings.orderType)) {
              message = `${orderFormSettings.orderType === "stopMarket" ? "Stop market" : "Limit market"} order placed successfully`;
            } else {
              message = "Limit order placed successfully";
            }
          }
        } else {
          message =
            status === "waitingForFill"
              ? "TP/SL order placed, waiting for fill trigger"
              : "TP/SL order placed, waiting to trigger";
        }
      }

      toast.success(message, { id: toastId });
    } catch (error) {
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const approveFeeAndEnableTrading = async () => {
    setProcessing(true);
    try {
      await Promise.all([approveBuilderFee(), enableTrading()]);
    } catch (error) {
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const onPlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // If trading is not enabled, we approve the builder fee and enable trading before placing the order
      if (shouldEnableTrading) {
        return await approveFeeAndEnableTrading();
      }

      await placeOrder(e);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order";

      toast.error(message, {
        id: toastId,
      });
    }
  };

  return { shouldEnableTrading, processing, onPlaceOrder };
};
