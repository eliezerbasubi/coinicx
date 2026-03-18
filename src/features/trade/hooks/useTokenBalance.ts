import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

import { CHAINS_CONFIG_ENV } from "@/lib/config/chains";

export const useTokenBalance = () => {
  const { address } = useAccount();

  const { data: tokenBalance, status } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    address: CHAINS_CONFIG_ENV.arbitrum.contracts.token.address,
    args: [address!],
    query: {
      enabled: !!address,
      select(data) {
        return formatUnits(data, 6);
      },
    },
  });

  return { tokenBalance, status };
};
