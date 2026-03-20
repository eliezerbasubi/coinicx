import { useState } from "react";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { ActiveTwap, AllPerpMetas, SpotMetas } from "@/lib/types/trade";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import {
  buildPerpAssetId,
  buildSpotAssetId,
  parseBuilderDeployedAsset,
} from "@/features/trade/utils";

import { useEnableTrading } from "./useEnableTrading";

const toastId = "terminate-twap";

const resolveAssetId = (twap: ActiveTwap): number => {
  const queryClient = getQueryClient();

  if (twap.isSpot) {
    const spotMetas = queryClient.getQueryData<SpotMetas>([
      QUERY_KEYS.spotMeta,
    ]);
    const tokens = spotMetas?.spotNamesToTokens?.get(twap.coin);

    if (!tokens) throw new Error("No data found for coin " + twap.coin);

    const spotId = spotMetas?.tokensToSpotId
      ?.get(tokens.baseToken)
      ?.get(tokens.quoteToken);

    if (!spotId) throw new Error("No asset ID matched for coin " + twap.coin);

    return buildSpotAssetId(spotId);
  }

  const allPerpMetas = queryClient.getQueryData<AllPerpMetas>([
    QUERY_KEYS.allPerpMetas,
  ]);

  if (allPerpMetas?.length) {
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

export const useTerminateTwap = () => {
  const { enableTrading } = useEnableTrading({ toastId });

  const [processing, setProcessing] = useState(false);

  const terminateTwap = async (twaps: ActiveTwap[]) => {
    if (!twaps.length) return;

    const isTerminatingAll = twaps.length > 1;

    try {
      setProcessing(true);

      toast.loading(
        isTerminatingAll ? "Terminating all TWAPs" : "Terminating TWAP",
        { id: toastId },
      );

      const exchClient = await enableTrading();

      for (const twap of twaps) {
        const assetId = resolveAssetId(twap);
        await exchClient.twapCancel({ a: assetId, t: twap.twapId });
      }

      toast.success(
        isTerminatingAll
          ? "All TWAPs terminated successfully"
          : "TWAP terminated successfully",
        { id: toastId },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to terminate TWAP";

      toast.error(message, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  return { processing, terminateTwap };
};
