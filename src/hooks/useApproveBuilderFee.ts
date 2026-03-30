import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddress } from "viem";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/lib/constants/errors";
import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { COINICX_BUILDER_SETTINGS } from "@/lib/constants/trade";
import { hlExchangeClient, hlInfoClient } from "@/lib/services/transport";

/** Total max fee rate for charging perps and spot (in tenths of bips). Equivalent to 0.01% */
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

  const hasApprovedBuilderFee =
    !!maxBuilderFee && maxBuilderFee >= MAX_FEE_RATE;

  const approveBuilderFee = async () => {
    if (hasApprovedBuilderFee) return true;

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

      if (error instanceof Error) {
        if (error.name === ERROR_NAME.AbstractWalletError) {
          message = "User rejected transaction signature";
        } else {
          message = error.message;
        }
      }

      throw new Error(message);
    }
  };

  return {
    maxBuilderFeeStatus,
    hasApprovedBuilderFee,
    approveBuilderFee,
  };
};

const toMaxFeeRate = (feeInTenthsOfBips: number): `${string}%` => {
  return `${feeInTenthsOfBips * 0.001}%`;
};
