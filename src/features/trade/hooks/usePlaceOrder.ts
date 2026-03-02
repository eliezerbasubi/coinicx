import { useState } from "react";
import { OrderParameters } from "@nktkas/hyperliquid";
import { toast } from "sonner";

import { Order, OrderSide } from "@/types/trade";
import {
  calculateSlippageAdjustedPrice,
  formatPriceToDecimal,
  formatSize,
  roundToDecimals,
} from "@/features/trade/utils";
import { buildOrder } from "@/features/trade/utils/orders";
import { isStopOrder } from "@/features/trade/utils/orderTypes";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import { calculateSubOrderSize, MAX_MINUTES, MIN_MINUTES } from "../utils/twap";
import { useApproveBuilderFee } from "./useApproveBuilderFee";
import { useEnableTrading } from "./useEnableTrading";

const toastId = "place-order";

export const usePlaceOrder = () => {
  const { shouldEnableTrading, enableTrading } = useEnableTrading({ toastId });
  const { builder, approveBuilderFee } = useApproveBuilderFee();

  const { settings, orderSide } = useShallowOrderFormStore((s) => ({
    settings: s.settings,
    orderSide: s.orderSide,
  }));

  const decimals = useTradeContext((s) => s.decimals);

  const isBuyOrder = orderSide === "buy";

  const [processing, setProcessing] = useState(false);

  const buildExchangeOrder = (params: {
    size: string;
    entryPrice?: string;
    type: Order["type"];
    isMarket?: boolean;
    reduceOnly?: boolean;
    isSzInNtl?: boolean;
    triggerPrice?: string;
    orderSide?: OrderSide;
  }) => {
    const { assetMeta, assetCtx } = useInstrumentStore.getState();

    if (!assetMeta || !assetCtx) {
      throw new Error("Asset metadata is not available");
    }

    const referencePx = assetCtx.referencePx;

    const size = parseFloat(params.size);

    const isNtl = params.isSzInNtl ?? settings.isSzInNtl;
    const sizeInBase = isNtl ? size / referencePx : size;

    const price = params.entryPrice
      ? parseFloat(params.entryPrice)
      : referencePx;

    return buildOrder({
      assetId: assetMeta.assetId,
      side: params.orderSide ?? orderSide,
      type: params.type,
      price: roundToDecimals(price, Number(decimals), "floor").toString(),
      size: formatSize(sizeInBase, assetMeta.szDecimals),
      reduceOnly: params.reduceOnly ?? settings.reduceOnly,
      timeInForce:
        settings.orderType === "limit"
          ? (settings.timeInForce as Order["timeInForce"])
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
    const tpslOrderSide = isBuyOrder ? "sell" : "buy";

    if (params.tpPrice) {
      const tpPrice = parseFloat(params.tpPrice);

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
          orderSide: tpslOrderSide,
          size: params.size,
          entryPrice: entryPrice.toString(),
          triggerPrice: tpPrice.toString(),
          type: "takeProfit",
        }),
      );
    }

    if (params.slPrice) {
      const slPrice = parseFloat(params.slPrice);

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

  const buildMarketOrder = () => {
    const formValues = useOrderFormStore.getState();
    const referencePx =
      useInstrumentStore.getState().assetCtx?.referencePx ?? 0;

    const entryPrice = calculateSlippageAdjustedPrice({
      entryPrice: referencePx,
      isBuyOrder,
    });

    const order = buildExchangeOrder({
      size: formValues.size,
      entryPrice: entryPrice.toString(),
      type: "market",
      isMarket: true,
    });

    const tspslOrders = buildTpSlOrders({
      size: formValues.size,
      tpPrice: formValues.tpslState.tpPrice || "",
      slPrice: formValues.tpslState.slPrice || "",
    });

    return {
      orders: [order, ...tspslOrders],
      grouping: tspslOrders.length ? "normalTpsl" : "na",
    };
  };

  const buildLimitOrder = () => {
    const formValues = useOrderFormStore.getState();

    const order = buildExchangeOrder({
      size: formValues.size,
      entryPrice: formValues.limitPrice,
      type: "limit",
      isMarket: false,
    });

    const tspslOrders = buildTpSlOrders({
      size: formValues.size,
      tpPrice: formValues.tpslState.tpPrice || "",
      slPrice: formValues.tpslState.slPrice || "",
    });

    return {
      orders: [order, ...tspslOrders],
      grouping: tspslOrders.length ? "normalTpsl" : "na",
    };
  };

  const buildStopOrders = () => {
    const formValues = useOrderFormStore.getState();
    const midPx = useInstrumentStore.getState().assetCtx?.midPx ?? 0;

    const triggerPrice = formValues.triggerPrice;
    const trigger = parseFloat(triggerPrice);

    if ((isBuyOrder && trigger < midPx) || (!isBuyOrder && trigger > midPx)) {
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

  const buildScaleOrders = () => {
    const scaleOrder = useOrderFormStore.getState().scaleOrder;

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

  const placeTwapOrder = async () => {
    try {
      const { twapOrder, size, settings } = useOrderFormStore.getState();

      const { assetCtx, assetMeta } = useInstrumentStore.getState();

      if (!assetCtx || !assetMeta) {
        throw new Error("Asset metadata is not available");
      }

      const parsedSize = parseFloat(size || "0");

      const subOrderSize = calculateSubOrderSize({
        size: parsedSize,
        minutes: twapOrder.minutes,
      });

      const subOrderValue = subOrderSize * assetCtx.midPx;

      if (subOrderValue < 10) {
        throw new Error(
          "Smallest TWAP suborder must have minimum value of 10 USD",
        );
      }

      if (twapOrder.minutes < MIN_MINUTES) {
        throw new Error(
          `Running time must be greater than or equal to ${MIN_MINUTES} minutes`,
        );
      }

      if (twapOrder.minutes > MAX_MINUTES) {
        throw new Error("Running time must be less than or equal to 24 hours");
      }

      setProcessing(true);

      toast.loading("Creating TWAP order", {
        id: toastId,
      });

      // Ensure the user has approved the builder fee before placing the order
      await approveBuilderFee();

      const exchClient = await enableTrading();

      await exchClient.twapOrder({
        twap: {
          a: assetMeta.assetId,
          b: isBuyOrder,
          m: twapOrder.minutes,
          s: formatSize(parsedSize, assetMeta.szDecimals),
          r: settings.reduceOnly,
          t: twapOrder.randomize,
        },
      });

      toast.success("TWAP order created successfully", {
        id: toastId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create TWAP order";

      toast.error(message, {
        id: toastId,
      });
    } finally {
      setProcessing(false);
    }
  };

  const getExchangeOrders = () => {
    let orderPayload = {
      orders: [] as OrderParameters["orders"],
      grouping: "na",
    };

    switch (settings.orderType) {
      case "market":
        orderPayload = buildMarketOrder();
        break;
      case "limit":
        orderPayload = buildLimitOrder();
        break;
      case "stopMarket":
      case "stopLimit":
        orderPayload = buildStopOrders();
        break;
      case "scale":
        orderPayload = buildScaleOrders();
        break;
      default:
        throw new Error("Unsupported order type");
    }

    if (orderPayload.orders.length === 0) {
      throw new Error("No orders to place");
    }
    return orderPayload;
  };

  const placeOrder = async () => {
    try {
      const orderPayload = getExchangeOrders();

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
            message = `${filled.totalSz} ${base} ${isBuyOrder ? "bought" : "sold"} at ${formatPriceToDecimal(Number(filled.avgPx), decimals, { style: "currency" })} avg. price`;

            break;
          }
          if ("resting" in status) {
            if (isStopOrder(settings.orderType)) {
              message = `${settings.orderType === "stopMarket" ? "Stop market" : "Limit market"} order placed successfully`;
            } else {
              message = "Limit order placed successfully";
            }

            break;
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

  const onPlaceOrder = async () => {
    try {
      // If trading is not enabled, we approve the builder fee and enable trading before placing the order
      if (shouldEnableTrading) {
        return await approveFeeAndEnableTrading();
      }

      if (settings.orderType === "twap") {
        return await placeTwapOrder();
      }
      await placeOrder();
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
