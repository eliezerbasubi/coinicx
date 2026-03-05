import { useState } from "react";
import { toast } from "sonner";

import { Position } from "@/types/trade";

import {
  calculateSlippageAdjustedPrice,
  formatSize,
  roundToDecimals,
} from "../utils";
import { buildOrder } from "../utils/orders";
import { useEnsureTradingEnabled } from "./useEnsureTradingEnabled";

const toastId = "trigger-price";

type TriggerPriceParams = {
  position: Position;
  tpPrice: string;
  slPrice: string;
  size: string;
};

type UseTriggerPriceArgs = {
  onSuccess?: () => void;
};

export const useTriggerPrice = (args?: UseTriggerPriceArgs) => {
  const { builder, enableTrading } = useEnsureTradingEnabled({ toastId });
  const [processing, setProcessing] = useState(false);

  const setTriggerPrice = async (params: TriggerPriceParams) => {
    try {
      const { position, tpPrice, slPrice, size } = params;

      if (!tpPrice && !slPrice) {
        throw new Error("Please set at least one trigger price");
      }

      const parsedSize = Math.abs(parseFloat(size));

      if (!parsedSize) {
        throw new Error("Size must be greater than 0");
      }

      // TP/SL orders are on the opposite side of the position
      const orderSide = position.isLong ? "sell" : "buy";
      const orders = [];

      if (tpPrice) {
        const tp = parseFloat(tpPrice);

        const entryPrice = calculateSlippageAdjustedPrice({
          entryPrice: tp,
          isBuyOrder: orderSide === "buy",
        });

        orders.push(
          buildOrder({
            assetId: position.assetId,
            price: roundToDecimals(
              entryPrice,
              position.pxDecimals,
              "floor",
            ).toString(),
            size: formatSize(parsedSize, position.szDecimals),
            reduceOnly: true,
            side: orderSide,
            type: "takeProfit",
            triggerPrice: tp.toString(),
            isMarket: true,
          }),
        );
      }

      if (slPrice) {
        const sl = parseFloat(slPrice);

        const entryPrice = calculateSlippageAdjustedPrice({
          entryPrice: sl,
          isBuyOrder: orderSide === "buy",
        });

        orders.push(
          buildOrder({
            assetId: position.assetId,
            price: roundToDecimals(
              entryPrice,
              position.pxDecimals,
              "floor",
            ).toString(),
            size: formatSize(parsedSize, position.szDecimals),
            reduceOnly: true,
            side: orderSide,
            type: "stopLoss",
            triggerPrice: sl.toString(),
            isMarket: true,
          }),
        );
      }

      setProcessing(true);
      toast.loading("Setting trigger price", { id: toastId });

      const exchClient = await enableTrading();

      const { response } = await exchClient.order({
        orders,
        grouping: "positionTpsl",
        builder,
      });

      let message = "Trigger price set successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "string" && status === "waitingForTrigger") {
          message = "TP/SL order placed, waiting to trigger";
          break;
        }
      }

      toast.success(message, { id: toastId });
      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to set trigger price";

      toast.error(message, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  return { processing, setTriggerPrice };
};
