import { useState } from "react";
import { toast } from "sonner";

import { useApproveBuilderFee } from "./useApproveBuilderFee";
import { useEnableTrading } from "./useEnableTrading";

type UseEnsureTradingEnabledArgs = {
  toastId?: string;
};

export const useEnsureTradingEnabled = (args?: UseEnsureTradingEnabledArgs) => {
  const { shouldEnableTrading, enableTrading } = useEnableTrading({
    toastId: args?.toastId,
  });
  const { builder, approveBuilderFee } = useApproveBuilderFee();

  const [processing, setProcessing] = useState(false);

  const approveFeeAndEnableTrading = async () => {
    setProcessing(true);
    try {
      await Promise.all([approveBuilderFee(), enableTrading()]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to enable trading";

      toast.error(message, { id: args?.toastId });
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    shouldEnableTrading,
    builder,
    enableTrading,
    approveBuilderFee,
    approveFeeAndEnableTrading,
  };
};
