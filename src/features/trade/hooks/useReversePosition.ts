import { useState } from "react";
import { toast } from "sonner";

import { Position } from "@/lib/types/trade";

import {
  calculateSlippageAdjustedPrice,
  formatSize,
  roundToDecimals,
} from "../utils";
import { buildOrder } from "../utils/orders";
import { useEnsureTradingEnabled } from "./useEnsureTradingEnabled";

const toastId = "reverse-position";

type ReversePositionParams = {
  position: Position;
};

type UseReversePositionArgs = {
  onSuccess?: () => void;
};

export const useReversePosition = (args?: UseReversePositionArgs) => {
  const { getBuilder, enableTrading } = useEnsureTradingEnabled({ toastId });
  const [processing, setProcessing] = useState(false);

  const reversePosition = async (params: ReversePositionParams) => {
    try {
      const { position } = params;

      const currentSize = Math.abs(parseFloat(position.szi));
      // Double the size: one to close, one to open reverse
      const reverseSize = currentSize * 2;
      const reverseSide = position.isLong ? "sell" : "buy";

      const orderValue = reverseSize * Number(position.markPx);
      if (orderValue < 10) {
        throw new Error("Order must have a minimum value of 10 USD");
      }

      const entryPrice = calculateSlippageAdjustedPrice({
        entryPrice: Number(position.markPx),
        isBuyOrder: reverseSide === "buy",
      });

      const order = buildOrder({
        assetId: position.assetId,
        price: roundToDecimals(
          entryPrice,
          position.pxDecimals,
          "floor",
        ).toString(),
        size: formatSize(reverseSize, position.szDecimals),
        reduceOnly: false,
        side: reverseSide,
        type: "market",
      });

      setProcessing(true);

      toast.loading("Reversing position", { id: toastId });

      const exchClient = await enableTrading();

      const { response } = await exchClient.order({
        orders: [order],
        grouping: "na",
        builder: getBuilder(position.assetId),
      });

      let message = "Position reversed successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "object" && "resting" in status) {
          message = "Reverse position order submitted successfully";
          break;
        }
      }

      toast.success(message, { id: toastId });
      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reverse position";

      toast.error(message, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  return { processing, reversePosition };
};
