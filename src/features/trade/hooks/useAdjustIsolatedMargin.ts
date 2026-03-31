import { useReducer } from "react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { useAgentClient } from "@/hooks/useAgentClient";

type State = {
  currentTab: "addMargin" | "reduceMargin";
  amount: string;
  processing: boolean;
};

type UseAdjustIsolatedMarginArgs = {
  onSuccess?: () => void;
};

export const useAdjustIsolatedMargin = (args?: UseAdjustIsolatedMarginArgs) => {
  const haptic = useWebHaptics();
  const { getAgentClient } = useAgentClient();

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      currentTab: "addMargin",
      amount: "",
      processing: false,
    },
  );

  const onAmountChange = (value: string) => {
    dispatch({ amount: value });
  };

  const onTabChange = (value: string) => {
    dispatch({ currentTab: value as "addMargin" | "reduceMargin" });
  };

  const adjustIsolatedMargin = async ({
    assetId,
    isLong,
  }: {
    assetId: number;
    isLong: boolean;
  }) => {
    try {
      if (Number(state.amount) <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      dispatch({ processing: true });

      const exchClient = await getAgentClient();

      const amount =
        state.currentTab === "addMargin"
          ? Number(state.amount)
          : -Number(state.amount);

      await exchClient.updateIsolatedMargin({
        asset: assetId,
        isBuy: isLong,
        ntli: amount * 1e6,
      });

      toast.success("Margin updated successfully");

      haptic.trigger("success");

      args?.onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update margin";

      toast.error(message);

      haptic.trigger("error");
    } finally {
      dispatch({ processing: false });
    }
  };

  return {
    state,
    onAmountChange,
    onTabChange,
    adjustIsolatedMargin,
  };
};
