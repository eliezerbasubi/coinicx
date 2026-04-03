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

export const useFeeRate = ({
  isMarket,
  isSpot = false,
}: {
  isMarket: boolean;
  isSpot?: boolean;
}) => {
  const { data: feesData } = useUserFees();

  // Fee rates: taker (cross) for market, maker (add) for limit
  const crossRate = isSpot
    ? Number(feesData?.userSpotCrossRate ?? "0")
    : Number(feesData?.userCrossRate ?? "0");

  const addRate = isSpot
    ? Number(feesData?.userSpotAddRate ?? "0")
    : Number(feesData?.userAddRate ?? "0");

  const rate = isMarket ? crossRate : addRate;

  // Builder fee: tenths of basis points → decimal
  const fee = isSpot
    ? COINICX_BUILDER_SETTINGS.spot
    : COINICX_BUILDER_SETTINGS.perps;
  const builderFeeRate = (fee * 0.001) / 100;

  return {
    rate,
    builderFeeRate,
    total: rate + builderFeeRate,
  };
};
