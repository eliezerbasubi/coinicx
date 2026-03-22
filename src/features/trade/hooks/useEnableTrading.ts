import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";

import { ERROR_NAME } from "@/lib/constants/errors";
import { hlExchangeClient } from "@/lib/services/transport";

import { COINICX_AGENT_SETTINGS } from "../constants";
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
  const haptic = useWebHaptics();
  const { address } = useAccount();
  const { data: agent, setOptimisticAgent } = useExtraAgents();

  const shouldEnableTrading = !agent || agent.validUntil < Date.now() / 1000;

  const enableTrading = async () => {
    try {
      if (!address) throw new Error("Wallet is not connected");

      // const agentAddress =
      //   useUserTradeStore.getState().webData?.userState.agentAddress;

      if (shouldEnableTrading) {
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
        haptic.trigger("success");
      }

      const agentWallet = privateKeyToAccount(COINICX_AGENT_SETTINGS.pk);
      const agentExchClient = await hlExchangeClient({ wallet: agentWallet });

      return agentExchClient;
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

  return { shouldEnableTrading, enableTrading };
};
