import { useCallback, useState } from "react";
import { AllPerpMetasResponse, SpotMetaResponse } from "@nktkas/hyperliquid";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { InstrumentType } from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { useAgentClient } from "@/hooks/useAgentClient";
import {
  buildSideAssetId,
  parseSideCoinFromCoin,
} from "@/features/predict/lib/utils/outcomes";
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

type CancelOrder = {
  oid: number;
  coin: string;
  type: InstrumentType;
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
      return {
        spotMetas: null,
        allPerpMetas: null,
      };
    }

    return {
      spotMetas: mapDataToSpotMetas(spotMetasResponse),
      allPerpMetas: mapDataToPerpsMetas(allPerpMetas),
    };
  }, []);

  const buildCancels = (openOrders: CancelOrder[]) => {
    if (!openOrders.length) throw new Error("No open orders to cancel");

    const { spotMetas, allPerpMetas } = getAssetMetas();

    const cancels = openOrders.map((order) => {
      if (order.type === "prediction") {
        const parsedData = parseSideCoinFromCoin(order.coin);

        if (!parsedData) throw new Error("No data found for coin" + order.coin);

        return {
          a: buildSideAssetId(parsedData.outcomeId, parsedData.sideIndex),
          o: order.oid,
        };
      }

      if (order.type === "spot" && spotMetas) {
        const tokens = spotMetas?.spotNamesToTokens?.get(order.coin);

        if (!tokens) throw new Error("No data found for coin" + order.coin);

        const spot = spotMetas?.tokenIndicesToSpot
          ?.get(tokens.baseToken)
          ?.get(tokens.quoteToken);

        if (!spot) throw new Error("No asset ID matched for coin" + order.coin);

        return { a: buildSpotAssetId(spot.spotId), o: order.oid };
      }

      if (order.type === "perps" && allPerpMetas) {
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
      }

      // throw error if order type is unknown
      throw new Error("Unknown order type: " + order.type);
    });

    return cancels;
  };

  const cancelOrder = async (openOrders: CancelOrder[]) => {
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
