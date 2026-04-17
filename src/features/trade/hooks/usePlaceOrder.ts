import { useState } from "react";
import { OrderParameters } from "@nktkas/hyperliquid";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { useAgentClient } from "@/hooks/useAgentClient";
import {
  formatPriceToDecimal,
  formatSize,
  getPriceDecimals,
} from "@/features/trade/utils";
import { getBuilder } from "@/features/trade/utils/builder";
import {
  buildLimitOrder,
  buildMarketOrder,
  buildScaleOrders,
  buildStopOrders,
} from "@/features/trade/utils/orders";
import { isStopOrder } from "@/features/trade/utils/orderTypes";

import { calculateSubOrderSize, MAX_MINUTES, MIN_MINUTES } from "../utils/twap";

const toastId = "place-order";

type UsePlaceOrderArgs = {
  assetId: number;
  szDecimals: number;
  isSpot: boolean;
  base: string;
};

type ExchangeOrderParams = {
  /** markPx for perps and midPx for spot */
  referencePx: number;

  /** midPx for computing notional value (for scale orders) */
  midPx: number;
  assetId: number;
  szDecimals: number;
  isSpot: boolean;
};

export const usePlaceOrder = ({
  assetId,
  szDecimals,
  isSpot,
  base,
}: UsePlaceOrderArgs) => {
  const haptic = useWebHaptics();
  const { getAgentClient } = useAgentClient();

  const { settings, orderSide } = useShallowOrderFormStore((s) => ({
    settings: s.settings,
    orderSide: s.orderSide,
  }));

  const isBuyOrder = orderSide === "buy";

  const [processing, setProcessing] = useState(false);

  const placeTwapOrder = async (midPx: number) => {
    try {
      const { twapOrder, size, settings } = useOrderFormStore.getState();

      const parsedSize = parseFloat(size || "0");

      const subOrderSize = calculateSubOrderSize({
        size: parsedSize,
        minutes: twapOrder.minutes,
      });

      const subOrderValue = subOrderSize * midPx;

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

      const exchClient = await getAgentClient();

      await exchClient.twapOrder({
        twap: {
          a: assetId,
          b: isBuyOrder,
          m: twapOrder.minutes,
          s: formatSize(parsedSize, szDecimals),
          r: settings.reduceOnly,
          t: twapOrder.randomize,
        },
      });

      toast.success("TWAP order created successfully", {
        id: toastId,
      });
      haptic.trigger("success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create TWAP order";

      toast.error(message, {
        id: toastId,
      });
      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  const getExchangeOrders = (params: ExchangeOrderParams) => {
    let orderPayload = {
      orders: [] as OrderParameters["orders"],
      grouping: "na",
    };

    switch (settings.orderType) {
      case "market":
        orderPayload = buildMarketOrder(params);
        break;
      case "limit":
        orderPayload = buildLimitOrder(params);
        break;
      case "stopMarket":
      case "stopLimit":
        orderPayload = buildStopOrders(params);
        break;
      case "scale":
        orderPayload = buildScaleOrders(params);
        break;
      default:
        throw new Error("Unsupported order type");
    }

    if (orderPayload.orders.length === 0) {
      throw new Error("No orders to place");
    }
    return orderPayload;
  };

  const placeOrder = async (params: ExchangeOrderParams) => {
    try {
      const orderPayload = getExchangeOrders(params);

      setProcessing(true);

      toast.loading("Submitting order", {
        id: toastId,
      });

      const exchClient = await getAgentClient();

      const { response } = await exchClient.order({
        orders: orderPayload.orders,
        grouping: orderPayload.grouping as OrderParameters["grouping"],
        builder: getBuilder(Number(orderPayload.orders[0].a)),
      });

      let message = "Order submitted successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "object") {
          if ("filled" in status) {
            const filled = status.filled;
            const decimals = getPriceDecimals(
              Number(filled.avgPx),
              szDecimals,
              isSpot,
            );
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
      haptic.trigger("success");
    } catch (error) {
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const onPlaceOrder = async (params: ExchangeOrderParams) => {
    try {
      if (settings.orderType === "twap") {
        return await placeTwapOrder(params.midPx);
      }
      await placeOrder(params);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order";

      toast.error(message, {
        id: toastId,
      });
      haptic.trigger("error");
    }
  };

  return { processing, onPlaceOrder };
};
