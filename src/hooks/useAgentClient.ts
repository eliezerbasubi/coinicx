import { privateKeyToAccount } from "viem/accounts";

import { COINICX_AGENT_SETTINGS } from "@/lib/constants/trade";
import { hlExchangeClient } from "@/lib/services/transport";

export const useAgentClient = () => {
  const getAgentClient = async () => {
    const agentWallet = privateKeyToAccount(COINICX_AGENT_SETTINGS.pk);
    const agentExchClient = await hlExchangeClient({ wallet: agentWallet });

    return agentExchClient;
  };

  return { getAgentClient };
};
