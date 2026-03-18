import { useState } from "react";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { AllPerpMetas, OpenOrder, SpotMetas } from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import {
  buildPerpAssetId,
  buildSpotAssetId,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

import { useEnableTrading } from "./useEnableTrading";

const toastId = "close-position";

type UseCancelOrderArgs = {
  onSuccess?: () => void;
};

export const useCancelOrder = (args?: UseCancelOrderArgs) => {
  const { enableTrading } = useEnableTrading({ toastId });

  const [processing, setProcessing] = useState(false);

  const buildCancels = (openOrders: OpenOrder[]) => {
    if (!openOrders.length) throw new Error("No open orders to cancel");

    const queryClient = getQueryClient();

    const allPerpMetas = queryClient.getQueryData<AllPerpMetas>([
      QUERY_KEYS.allPerpMetas,
    ]);
    const spotMetas = queryClient.getQueryData<SpotMetas>([
      QUERY_KEYS.spotMeta,
    ]);

    return openOrders.map((order) => {
      if (order.isSpot) {
        const tokens = spotMetas?.spotNamesToTokens?.get(order.coin);

        if (!tokens) throw new Error("No data found for coin" + order.coin);

        const spotId = spotMetas?.tokensToSpotId
          ?.get(tokens.baseToken)
          ?.get(tokens.quoteToken);

        if (!spotId)
          throw new Error("No asset ID mateched for coin" + order.coin);

        return { a: buildSpotAssetId(spotId), o: order.oid };
      }

      // Resolve perp asset ID at cancel time
      let assetId = 0;

      if (allPerpMetas?.length) {
        const { dex } = parseBuilderDeployedAsset(order.coin);

        for (const perpMeta of allPerpMetas) {
          if (perpMeta.dex !== dex) continue;

          const universeIndex = perpMeta.universe.findIndex(
            (u) => u.name.toLowerCase() === order.coin.toLowerCase(),
          );

          if (universeIndex !== -1) {
            assetId = buildPerpAssetId({
              perpDexIndex: perpMeta.perpDexIndex,
              universeIndex,
            });
            break;
          }
        }
      }

      return { a: assetId, o: order.oid };
    });
  };

  const cancelOrder = async (openOrders: OpenOrder[]) => {
    try {
      const cancels = buildCancels(openOrders);

      const isCancellingAll = cancels.length > 1;

      setProcessing(true);

      toast.loading(
        isCancellingAll ? "Cancelling all orders" : "Cancelling order",
        {
          id: toastId,
        },
      );

      const exchClient = await enableTrading();

      await exchClient.cancel({
        cancels,
      });

      const message = `${isCancellingAll ? "Orders" : "Order"} canceled successfully`;

      toast.success(message, { id: toastId });

      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel orders";

      toast.error(message, {
        id: toastId,
      });
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    cancelOrder,
  };
};
