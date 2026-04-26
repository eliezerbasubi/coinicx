import { useCallback, useState } from "react";
import { AllPerpMetasResponse, SpotMetaResponse } from "@nktkas/hyperliquid";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { ActiveTwap, AllPerpMetas, SpotMetas } from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { useAgentClient } from "@/hooks/useAgentClient";
import {
  buildPerpAssetId,
  buildSpotAssetId,
  mapDataToPerpsMetas,
  mapDataToSpotMetas,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

const toastId = "terminate-twap";

export const useTerminateTwap = () => {
  const haptic = useWebHaptics();
  const { getAgentClient } = useAgentClient();

  const [processing, setProcessing] = useState(false);

  const getAssetMetas = useCallback(() => {
    const queryClient = getQueryClient();

    const allPerpMetas = queryClient.getQueryData<AllPerpMetasResponse>(
      QUERY_KEYS.allPerpMetas,
    );
    const spotMetasResponse = queryClient.getQueryData<SpotMetaResponse>(
      QUERY_KEYS.spotMeta,
    );

    if (!spotMetasResponse || !allPerpMetas) {
      throw new Error("No meta found for terminating TWAPs");
    }

    return {
      spotMetas: mapDataToSpotMetas(spotMetasResponse),
      allPerpMetas: mapDataToPerpsMetas(allPerpMetas),
    };
  }, []);

  const terminateTwap = async (twaps: ActiveTwap[]) => {
    if (!twaps.length) return;

    const isTerminatingAll = twaps.length > 1;

    try {
      setProcessing(true);

      toast.loading(
        isTerminatingAll ? "Terminating all TWAPs" : "Terminating TWAP",
        { id: toastId },
      );

      const exchClient = await getAgentClient();

      const { spotMetas, allPerpMetas } = getAssetMetas();

      for (const twap of twaps) {
        const assetId = resolveAssetId(twap, spotMetas, allPerpMetas);
        await exchClient.twapCancel({ a: assetId, t: twap.twapId });
      }

      toast.success(
        isTerminatingAll
          ? "All TWAPs terminated successfully"
          : "TWAP terminated successfully",
        { id: toastId },
      );
      haptic.trigger("success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to terminate TWAP";

      toast.error(message, { id: toastId });
      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  return { processing, terminateTwap };
};

const resolveAssetId = (
  twap: ActiveTwap,
  spotMetas: SpotMetas,
  allPerpMetas: AllPerpMetas,
): number => {
  if (twap.isSpot) {
    const tokens = spotMetas?.spotNamesToTokens?.get(twap.coin);

    if (!tokens) throw new Error("No data found for coin " + twap.coin);

    const spot = spotMetas?.tokenIndicesToSpot
      ?.get(tokens.baseToken)
      ?.get(tokens.quoteToken);

    if (!spot) throw new Error("No asset ID matched for coin " + twap.coin);

    return buildSpotAssetId(spot.spotId);
  }

  if (allPerpMetas.length) {
    const { dex } = parseBuilderDeployedAsset(twap.coin);

    for (const perpMeta of allPerpMetas) {
      if (perpMeta.dex !== dex) continue;

      const universeIndex = perpMeta.universe.findIndex(
        (u) => u.name.toLowerCase() === twap.coin.toLowerCase(),
      );

      if (universeIndex !== -1) {
        return buildPerpAssetId({
          perpDexIndex: perpMeta.perpDexIndex,
          universeIndex,
        });
      }
    }
  }

  return -1;
};
