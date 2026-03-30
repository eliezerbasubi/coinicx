import React, { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";
import { useApproveBuilderFee } from "@/hooks/useApproveBuilderFee";
import { useEnableTrading } from "@/hooks/useEnableTrading";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const toastId = "enable-trading";

const EnableTradingModal = ({ open, onOpenChange }: Props) => {
  const { isEnableTradingRequired, enableTrading } = useEnableTrading({
    toastId,
  });

  const { approveBuilderFee, hasApprovedBuilderFee } = useApproveBuilderFee();

  const [processing, setProcessing] = useState(false);

  const onClick = async () => {
    setProcessing(true);

    let builderFeeApproved = hasApprovedBuilderFee;
    let tradingEnabled = !isEnableTradingRequired;

    try {
      if (!hasApprovedBuilderFee) {
        builderFeeApproved = await approveBuilderFee();
      }

      if (isEnableTradingRequired) {
        tradingEnabled = await enableTrading();
      }

      // Close modal if user has completed all the steps
      if (builderFeeApproved && tradingEnabled) {
        onOpenChange?.(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to enable trading";

      toast.error(message, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enable Trading"
      description="To get started, please approve a small builder fee that helps us keep your trading experience smooth and enable an agent that helps you trade instantly."
      headerClassName="gap-2"
    >
      <div className="w-full flex flex-col gap-4 pt-4 pb-6">
        <Step
          title="Approve builder fee"
          status={hasApprovedBuilderFee ? "Approved" : "Not approved"}
          step={1}
          completed={hasApprovedBuilderFee}
        />
        <Step
          title="Enable trading"
          status={isEnableTradingRequired ? "Disabled" : "Enabled"}
          step={2}
          completed={!isEnableTradingRequired}
        />
      </div>

      <p className="text-xs text-neutral-gray-400">
        Approving the builder fee and enabling trading are gas-less actions.
      </p>

      <Button
        onClick={onClick}
        disabled={processing}
        loading={processing}
        className="mt-2"
      >
        {!hasApprovedBuilderFee ? "Approve Builder Fee" : "Enable Trading"}
      </Button>
    </AdaptiveDialog>
  );
};

const Step = ({
  title,
  status,
  step,
  completed,
}: {
  title: string;
  status: string;
  step: number;
  completed?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-full flex items-center justify-center bg-primary/10 text-primary text-sm">
          {step}
        </div>
        <p className="text-sm">{title}</p>
      </div>
      <p
        className={cn("text-sm text-neutral-gray-400", {
          "text-green-500": completed,
        })}
      >
        {status}
      </p>
    </div>
  );
};

export default EnableTradingModal;
