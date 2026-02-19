import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddress } from "viem";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/constants/errors";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { hlExchangeClient, hlInfoClient } from "@/services/transport";

import { COINICX_BUILDER_SETTINGS } from "../constants";

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

  const approveBuilderFee = async () => {
    if (maxBuilderFee === COINICX_BUILDER_SETTINGS.f) return true;

    try {
      const exchClient = await hlExchangeClient();
      await exchClient.approveBuilderFee({
        builder: builderAddress,
        maxFeeRate: toMaxFeeRate(COINICX_BUILDER_SETTINGS.f),
      });

      queryClient.setQueryData(
        [QUERY_KEYS.maxBuilderFee, address],
        COINICX_BUILDER_SETTINGS.f,
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
    builder: {
      b: builderAddress,
      f: COINICX_BUILDER_SETTINGS.f,
    },
    maxBuilderFeeStatus,
    approveBuilderFee,
  };
};

/**
 * Converts the builder fee from tenths of a basis point to a percentage string.
 */
const toMaxFeeRate = (feeInTenthsOfBips: number): `${string}%` => {
  return `${feeInTenthsOfBips * 0.001}%`;
};
