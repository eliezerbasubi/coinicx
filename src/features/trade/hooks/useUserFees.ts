import { UserFeesResponse } from "@nktkas/hyperliquid";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { hlInfoClient } from "@/services/transport";

export const useUserFees = (
  options?: Omit<
    UseQueryOptions<UserFeesResponse>,
    "queryKey" | "queryFn" | "staleTime"
  >,
) => {
  const { address } = useAccount();
  const user = address || zeroAddress;

  const { data, status } = useQuery({
    queryKey: ["user-fees", user],
    staleTime: Infinity,
    queryFn: () => hlInfoClient.userFees({ user }),
    ...options,
  });

  return { data, status };
};
