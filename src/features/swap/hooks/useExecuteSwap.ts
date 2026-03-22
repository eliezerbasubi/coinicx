import { useState } from "react";
import { OrderParameters } from "@nktkas/hyperliquid";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { useEnsureTradingEnabled } from "@/features/trade/hooks/useEnsureTradingEnabled";

import { useSwapStore } from "../store";

const toastId = "swap-toast";

export const useExecuteSwap = () => {
  const haptic = useWebHaptics();
  const { getBuilder, enableTrading } = useEnsureTradingEnabled({
    toastId,
  });

  const [processing, setProcessing] = useState(false);

  const executeSwap = async () => {
    const { sellToken, buyToken, sellAmount, buyAmount, route, getSwapOrders } =
      useSwapStore.getState();

    try {
      const orders = getSwapOrders();

      setProcessing(true);
      toast.loading(
        `Swapping ${sellAmount} ${sellToken?.name} for ${buyAmount} ${buyToken?.name}`,
        { id: toastId },
      );

      const exchClient = await enableTrading();

      const builder = getBuilder(Number(orders[0].a));

      const { response } = await exchClient.order({
        orders,
        grouping: "na" as OrderParameters["grouping"],
        builder: {
          b: builder.b,
          f: Number(route!.fee) * 100,
        },
      });

      let message = "Swap completed successfully";

      for (const status of response.data.statuses) {
        if (typeof status === "object") {
          if ("filled" in status) {
            const filled = status.filled;
            message = `Swapped ${filled.totalSz} ${sellToken?.name} to ${buyToken?.name}`;

            break;
          }
          if ("resting" in status) {
            message = "Swap incomplete. Order resting on the orderbook";

            break;
          }
        }
      }

      toast.success(message, { id: toastId });
      haptic.trigger("success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to swap tokens";
      toast.error(message, { id: toastId });
      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  return { processing, executeSwap };
};
