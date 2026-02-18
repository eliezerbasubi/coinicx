import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { hlInfoClient } from "@/services/transport";

export const useUserFees = () => {
  const { address } = useAccount();
  const user = address || zeroAddress;

  const { data, status } = useQuery({
    queryKey: ["user-fees", user],
    staleTime: Infinity,
    queryFn: () => hlInfoClient.userFees({ user }),
  });

  return { data, status };
};
