import { useState } from "react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { Position } from "@/lib/types/trade";
import { useAgentClient } from "@/hooks/useAgentClient";
import {
  calculateSlippageAdjustedPrice,
  formatSize,
  getPriceDecimals,
  roundToDecimals,
} from "@/features/trade/utils";
import { getBuilder } from "@/features/trade/utils/builder";
import { buildOrder } from "@/features/trade/utils/orders";

const toastId = "close-position";

type ClosePositionParams = {
  positions: Position[];
  limitPrice?: string;
  size?: string;
  closeBy: "market" | "limit";
};

type UseClosePositionArgs = {
  onSuccess?: () => void;
};

export const useClosePosition = (args?: UseClosePositionArgs) => {
  const haptic = useWebHaptics();
  const { getAgentClient } = useAgentClient();

  const buildClosingOrders = (params: ClosePositionParams) => {
    const {
      positions,
      limitPrice: userLimitPx,
      closeBy,
      size: userOrderSize,
    } = params;
    const isMarket = closeBy === "market";

    if (!positions.length) throw new Error("No positions to close");

    const orders = positions.map((position) => {
      const limitPrice = userLimitPx || position.midPx;
      const size = userOrderSize || position.szi;

      const entryPrice = isMarket
        ? calculateSlippageAdjustedPrice({
            entryPrice: Number(position.markPx),
            isBuyOrder: !position.isLong,
          })
        : Number(limitPrice);

      const decimals = getPriceDecimals(entryPrice, position.szDecimals, false);

      const parsedSize = Math.abs(parseFloat(size));
      const orderValue = parsedSize * Number(position.markPx);

      if (orderValue < 10) {
        throw new Error("Order must have a minimum value of 10 USD");
      }

      return buildOrder({
        assetId: position.assetId,
        price: roundToDecimals(entryPrice, decimals, "floor").toString(),
        size: formatSize(parsedSize, position.szDecimals),
        reduceOnly: true,
        side: position.isLong ? "sell" : "buy",
        type: closeBy,
      });
    });

    return orders;
  };

  const [processing, setProcessing] = useState(false);

  const closePosition = async (params: ClosePositionParams) => {
    try {
      const orders = buildClosingOrders(params);

      const isClosingAllPositions = orders.length > 1;

      setProcessing(true);

      toast.loading(
        isClosingAllPositions ? "Closing all positions" : "Closing position",
        {
          id: toastId,
        },
      );

      const exchClient = await getAgentClient();

      const { response } = await exchClient.order({
        orders,
        grouping: "na",
        builder: getBuilder(Number(orders[0].a)),
      });

      let message = `${isClosingAllPositions ? "Positions" : "Position"} closed successfully`;

      for (const status of response.data.statuses) {
        if (typeof status === "object") {
          if ("resting" in status) {
            message = "Close limit position submitted successfully";

            break;
          }
        }
      }

      toast.success(message, { id: toastId });
      haptic.trigger("success");
      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to close positions";

      toast.error(message, {
        id: toastId,
      });
      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    closePosition,
  };
};
