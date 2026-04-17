import { useState } from "react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { Position } from "@/lib/types/trade";
import { useAgentClient } from "@/hooks/useAgentClient";
import {
  calculateSlippageAdjustedPrice,
  formatSize,
  roundToDecimals,
} from "@/features/trade/utils";
import { getBuilder } from "@/features/trade/utils/builder";
import { buildOrder } from "@/features/trade/utils/orders";

const toastId = "trigger-price";

type TriggerPriceParams = {
  position: Position;
  tpPrice: string;
  slPrice: string;
  size: string;
};

type UseSetTriggerPriceArgs = {
  onSuccess?: () => void;
};

export const useSetTriggerPrice = (args?: UseSetTriggerPriceArgs) => {
  const haptic = useWebHaptics();
  const { getAgentClient } = useAgentClient();
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

      const exchClient = await getAgentClient();

      const { response } = await exchClient.order({
        orders,
        grouping: "positionTpsl",
        builder: getBuilder(Number(orders[0].a)),
      });

      let message = "Trigger price set successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "string" && status === "waitingForTrigger") {
          message = "TP/SL order placed, waiting to trigger";
          break;
        }
      }

      toast.success(message, { id: toastId });
      haptic.trigger("success");
      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to set trigger price";

      toast.error(message, { id: toastId });
      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  return { processing, setTriggerPrice };
};
