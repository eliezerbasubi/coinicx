import { ExtraAgentsResponse } from "@nktkas/hyperliquid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { COINICX_AGENT_SETTINGS } from "@/lib/constants/trade";
import { hlInfoClient } from "@/lib/services/transport";

export const useExtraAgents = () => {
  const { address } = useAccount();
  const user = address || zeroAddress;

  const queryClient = useQueryClient();

  const { data, status } = useQuery({
    queryKey: [QUERY_KEYS.extraAgents, user],
    staleTime: Infinity,
    queryFn: async () => {
      const agents = await hlInfoClient.extraAgents({ user });

      const agent = agents.find(
        (agent) =>
          isAddressEqual(agent.address, COINICX_AGENT_SETTINGS.agentAddress) &&
          agent.name === COINICX_AGENT_SETTINGS.agentName,
      );

      return agent ?? null;
    },
  });

  /**
   * Optimistically set agent data after enabling trading to avoid waiting for the next successful fetch
   * Set validUntil to 180 days from now as that's the typical validity period for approved agents, but it will be updated to the correct value on the next successful fetch
   */
  const setOptimisticAgent = (
    data: Omit<ExtraAgentsResponse[number], "validUntil">,
  ) => {
    const validUntil = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60;
    queryClient.setQueryData([QUERY_KEYS.extraAgents, user], {
      ...data,
      validUntil,
    });
  };

  return { data, status, setOptimisticAgent };
};
