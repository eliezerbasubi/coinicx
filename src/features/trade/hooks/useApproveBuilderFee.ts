import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddress } from "viem";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/lib/constants/errors";
import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlExchangeClient, hlInfoClient } from "@/lib/services/transport";

import { COINICX_BUILDER_SETTINGS } from "../constants";

const MAX_FEE_RATE = 100;

export const useApproveBuilderFee = () => {
  const { address } = useAccount();

  const builderAddress = getAddress(COINICX_BUILDER_SETTINGS.b);

  const queryClient = useQueryClient();

  const { data: maxBuilderFee, status: maxBuilderFeeStatus } = useQuery({
    queryKey: [QUERY_KEYS.maxBuilderFee, address],
    enabled: !!address,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    queryFn: () =>
      hlInfoClient.maxBuilderFee({
        user: address!,
        builder: builderAddress,
      }),
  });

  const getBuilder = (assetId: number) => {
    // Spot Ids start at 10_000
    const isSpot = assetId > 10_000;

    const fee = isSpot
      ? COINICX_BUILDER_SETTINGS.spot
      : COINICX_BUILDER_SETTINGS.perps;
    return {
      b: COINICX_BUILDER_SETTINGS.b,
      f: fee,
    };
  };

  const approveBuilderFee = async () => {
    if (maxBuilderFee && maxBuilderFee >= MAX_FEE_RATE) return true;

    try {
      const exchClient = await hlExchangeClient();
      await exchClient.approveBuilderFee({
        builder: builderAddress,
        maxFeeRate: toMaxFeeRate(MAX_FEE_RATE), // Let the user approve the max fee rate
      });

      queryClient.setQueryData(
        [QUERY_KEYS.maxBuilderFee, address],
        MAX_FEE_RATE,
      );

      return true;
    } catch (error) {
      let message = "Failed to approve builder fee";

      if (
        error instanceof Error &&
        error.name === ERROR_NAME.AbstractWalletError
      ) {
        message = "User rejected transaction signature";
      }

      throw new Error(message);
    }
  };

  return {
    maxBuilderFeeStatus,
    getBuilder,
    approveBuilderFee,
  };
};

const toMaxFeeRate = (feeInTenthsOfBips: number): `${string}%` => {
  return `${feeInTenthsOfBips * 0.001}%`;
};
