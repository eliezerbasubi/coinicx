import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddress } from "viem";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/constants/errors";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { hlExchangeClient, hlInfoClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";

import { COINICX_BUILDER_SETTINGS } from "../constants";

const MAX_FEE_RATE = 100;

export const useApproveBuilderFee = () => {
  const { address } = useAccount();

  const builderAddress = getAddress(COINICX_BUILDER_SETTINGS.b);
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  const fee = isPerps
    ? COINICX_BUILDER_SETTINGS.perps
    : COINICX_BUILDER_SETTINGS.spot;

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
    builder: {
      b: builderAddress,
      f: fee,
    },
    maxBuilderFeeStatus,
    approveBuilderFee,
  };
};

const toMaxFeeRate = (feeInTenthsOfBips: number): `${string}%` => {
  return `${feeInTenthsOfBips * 0.001}%`;
};
