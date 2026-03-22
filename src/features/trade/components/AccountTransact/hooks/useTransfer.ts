import { useMemo, useReducer } from "react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { hlExchangeClient } from "@/lib/services/transport";
import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";

const toastId = "transfer-account";

type Direction = "spot-to-perps" | "perps-to-spot";

type State = {
  direction: Direction;
  amount: string;
  processing: boolean;
};

export const useTransfer = () => {
  const haptic = useWebHaptics();
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { direction: "spot-to-perps", amount: "", processing: false },
  );

  const { spotBalance, perpsBalance } = useShallowUserTradeStore((s) => ({
    spotBalance: s.spotBalances.find((balance) => balance.token === 0),
    perpsBalance: s.allDexsClearinghouseState?.withdrawable ?? "0",
  }));

  const toPerp = state.direction === "spot-to-perps";

  const availableBalance = useMemo(() => {
    if (toPerp) {
      return spotBalance
        ? Number(spotBalance.total) - Number(spotBalance.hold)
        : 0;
    }
    return Number(perpsBalance || "0");
  }, [toPerp, spotBalance, perpsBalance]);

  const toggleDirection = () => {
    dispatch({
      direction:
        state.direction === "spot-to-perps" ? "perps-to-spot" : "spot-to-perps",
    });
  };

  const fromLabel = toPerp ? "Spot" : "Perps";
  const toLabel = toPerp ? "Perps" : "Spot";

  const parsedAmount = parseFloat(state.amount);

  const label = useMemo(() => {
    if (parsedAmount && parsedAmount > availableBalance) {
      return {
        text: "Insufficient token to transfer",
        disabled: true,
      };
    }

    return { text: "Transfer", disabled: false };
  }, [state.amount, availableBalance]);

  const transfer = async () => {
    try {
      dispatch({ processing: true });

      const formattedAmount = formatNumber(parsedAmount);

      toast.loading(`Transferring ${formattedAmount} USDC`, { id: toastId });

      const exchClient = await hlExchangeClient();

      await exchClient.usdClassTransfer({
        amount: parsedAmount,
        toPerp,
      });

      toast.success(
        `Transferred ${formattedAmount} USDC to ${toPerp ? "Perps" : "Spot"}`,
        { id: toastId },
      );
      haptic.trigger("success");

      useAccountTransactStore.getState().closeAccountTransact();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to transfer tokens";

      toast.error(message, { id: toastId });
      haptic.trigger("error");
    } finally {
      dispatch({ processing: false });
    }
  };

  return {
    availableBalance,
    state,
    fromLabel,
    toLabel,
    label,
    dispatch,
    toggleDirection,
    transfer,
  };
};
