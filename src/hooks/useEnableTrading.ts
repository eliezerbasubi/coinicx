import { toast } from "sonner";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/lib/constants/errors";
import { COINICX_AGENT_SETTINGS } from "@/lib/constants/trade";
import { hlExchangeClient } from "@/lib/services/transport";

import { useExtraAgents } from "./useExtraAgents";

type UseEnableTradingArgs = {
  toastId?: string;
};

/**
 * Enable trading by approving agent wallet
 * @param args
 * @returns
 */
export const useEnableTrading = (args?: UseEnableTradingArgs) => {
  const { address } = useAccount();
  const { data: agent, setOptimisticAgent } = useExtraAgents();

  const isEnableTradingRequired =
    !!address && (!agent || agent.validUntil < Date.now() / 1000);

  const enableTrading = async () => {
    try {
      if (!address) throw new Error("Wallet is not connected");
      if (!COINICX_AGENT_SETTINGS.pk) throw new Error("Agent PK is not set");

      // User has already approved the agent wallet
      if (!isEnableTradingRequired) return true;

      toast.loading("Enabling trading", {
        id: args?.toastId,
      });

      const exchClient = await hlExchangeClient();
      await exchClient.approveAgent(COINICX_AGENT_SETTINGS);

      setOptimisticAgent({
        name: COINICX_AGENT_SETTINGS.agentName,
        address: COINICX_AGENT_SETTINGS.agentAddress,
      });

      toast.success("Trading enabled successfully", {
        id: args?.toastId,
      });

      return true;
    } catch (error) {
      let message = "Failed to enable trading";

      if (
        error instanceof Error &&
        error.name === ERROR_NAME.AbstractWalletError
      ) {
        message = "User rejected transaction signature";
      }

      throw new Error(message);
    }
  };

  return { isEnableTradingRequired, enableTrading };
};
