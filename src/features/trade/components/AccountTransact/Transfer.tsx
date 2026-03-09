"use client";

import { ArrowLeftRight } from "lucide-react";

import ConnectButton from "@/components/common/ConnectButton";
import FormInputControl from "@/components/common/FormInputControl";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import { useTransfer } from "./hooks/useTransfer";

const TransferTab = () => {
  const {
    availableBalance,
    state,
    label,
    toLabel,
    fromLabel,
    toggleDirection,
    transfer,
    dispatch,
  } = useTransfer();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <span className="text-xs text-neutral-gray-400">From</span>
          <div className="bg-neutral-gray-200 rounded-md p-2.5 text-sm text-white font-medium">
            {fromLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDirection}
          className="mt-4 p-1.5 text-neutral-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeftRight className="size-4" />
        </button>

        <div className="flex-1 space-y-1">
          <span className="text-xs text-neutral-gray-400">To</span>
          <div className="bg-neutral-gray-200 rounded-md p-2.5 text-sm text-white font-medium">
            {toLabel}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <FormInputControl
          value={state.amount}
          max={availableBalance}
          onValueChange={(amount) => dispatch({ amount })}
          label="Amount"
          placeholder="0.00"
          trailing={
            <span
              className={cn("text-sm text-neutral-gray-400 font-medium", {
                "text-white": !!state.amount,
              })}
            >
              USDC
            </span>
          }
        />
      </div>
      <div className="w-full space-y-1 bg-neutral-gray-200 p-2 rounded-lg mb-1">
        <InfoTile
          label="Available Balance"
          value={`${formatNumber(availableBalance, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`}
        />
        <InfoTile label="Estimated time" value={"Instant"} />
      </div>

      <ConnectButton
        className="w-full"
        disabled={
          !state.amount ||
          Number(state.amount) <= 0 ||
          label.disabled ||
          state.processing
        }
        loading={state.processing}
        onClick={transfer}
        label={label.text}
      />
    </div>
  );
};

const InfoTile = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center">
    <p className="text-xs text-neutral-gray-400">{label}</p>
    <p className="text-xs text-white font-medium">{value}</p>
  </div>
);

export default TransferTab;
