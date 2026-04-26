import { useQueries } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

export const usePortfolioData = () => {
  const { address } = useAccount();
  const user = address ?? zeroAddress;

  const { data, isLoading } = useQueries({
    combine(results) {
      const [portfolioResult, delegatorResult, feesResult] = results;

      const stakingValue =
        Number(delegatorResult.data?.delegated ?? "0") +
        Number(delegatorResult.data?.undelegated ?? "0") +
        Number(delegatorResult.data?.totalPendingWithdrawal ?? "0");

      const dailyUserVlm = feesResult.data?.dailyUserVlm ?? [];
      const volume14d = dailyUserVlm
        .slice(-14)
        .reduce(
          (sum, entry) => sum + Number(entry.userCross) + Number(entry.userAdd),
          0,
        );

      return {
        data: {
          portfolio: new Map(portfolioResult.data),
          stakingValue,
          volume14d,
          fees: feesResult.data,
          delegatorSummary: delegatorResult.data,
        },
        isLoading:
          portfolioResult.isLoading ||
          delegatorResult.isLoading ||
          feesResult.isLoading,
      };
    },
    queries: [
      {
        queryKey: QUERY_KEYS.portfolio(user),
        enabled: !!address,
        staleTime: 5 * 60 * 1000,
        queryFn: () => hlInfoClient.portfolio({ user }),
      },
      {
        queryKey: QUERY_KEYS.delegatorSummary(user),
        enabled: !!address,
        staleTime: 5 * 60 * 1000,
        queryFn: () => hlInfoClient.delegatorSummary({ user }),
      },
      {
        queryKey: QUERY_KEYS.userFees(user),
        enabled: !!address,
        staleTime: Infinity,
        queryFn: () => hlInfoClient.userFees({ user }),
      },
    ],
  });

  return { data, isLoading };
};
