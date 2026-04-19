import { useCallback, useState } from "react";
import { AllPerpMetasResponse, SpotMetaResponse } from "@nktkas/hyperliquid";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { OpenOrder } from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { useAgentClient } from "@/hooks/useAgentClient";
import {
  buildPerpAssetId,
  buildSpotAssetId,
  mapDataToPerpsMetas,
  mapDataToSpotMetas,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

const toastId = "close-position";

type UseCancelOrderArgs = {
  onSuccess?: () => void;
};

export const useCancelOrder = (args?: UseCancelOrderArgs) => {
  const haptic = useWebHaptics();
  const { getAgentClient } = useAgentClient();

  const [processing, setProcessing] = useState(false);

  const getAssetMetas = useCallback(() => {
    const queryClient = getQueryClient();

    const allPerpMetas = queryClient.getQueryData<AllPerpMetasResponse>([
      QUERY_KEYS.allPerpMetas,
    ]);
    const spotMetasResponse = queryClient.getQueryData<SpotMetaResponse>([
      QUERY_KEYS.spotMeta,
    ]);

    if (!spotMetasResponse || !allPerpMetas) {
      throw new Error("No meta found for canceling open orders");
    }

    return {
      spotMetas: mapDataToSpotMetas(spotMetasResponse),
      allPerpMetas: mapDataToPerpsMetas(allPerpMetas),
    };
  }, []);

  const buildCancels = (openOrders: OpenOrder[]) => {
    if (!openOrders.length) throw new Error("No open orders to cancel");

    const { spotMetas, allPerpMetas } = getAssetMetas();

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

      const exchClient = await getAgentClient();

      await exchClient.cancel({
        cancels,
      });

      const message = `${isCancellingAll ? "Orders" : "Order"} canceled successfully`;

      toast.success(message, { id: toastId });
      haptic.trigger("success");

      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel orders";

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
    cancelOrder,
  };
};
