import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { COINICX_BUILDER_SETTINGS } from "@/lib/constants/trade";
import { hlInfoClient } from "@/lib/services/transport";

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

export const useFeeRate = ({ isMarket }: { isMarket: boolean }) => {
  const { data: feesData } = useUserFees();

  // Fee rates: taker for market, maker for limit
  const feeRate = isMarket
    ? Number(feesData?.userCrossRate ?? "0")
    : Number(feesData?.userAddRate ?? "0");

  // Builder fee: tenths of basis points → decimal
  const builderFeeRate = (COINICX_BUILDER_SETTINGS.perps * 0.001) / 100;

  return feeRate + builderFeeRate;
};
