"use client";

import { AlertTriangleIcon, ClipboardIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import ConnectButton from "@/components/common/ConnectButton";
import FormInputControl from "@/components/common/FormInputControl";
import { Input } from "@/components/ui/input";
import { Summary, SummaryItem } from "@/components/ui/summary";

import { useWithdraw } from "./hooks/useWithdraw";
import TokenSelect from "./TokenSelect";

const WithdrawTab = () => {
  const {
    currentNetworkInfo,
    currentAssetInfo,
    unitFees,
    label,
    tokens,
    state,
    withdrawFee,
    onPasteAddress,
    dispatch,
    withdraw,
  } = useWithdraw();

  return (
    <div className="space-y-2">
      <TokenSelect
        showBalance
        token={currentAssetInfo}
        tokens={tokens}
        onTokenChange={(token) => dispatch({ token: token.symbol })}
      />

      <div className="w-full h-9 pr-3 flex items-center gap-x-2 justify-between text-neutral-gray-100 font-medium rounded-md border border-neutral-gray-200 focus-within:border-primary">
        <Input
          type="text"
          placeholder={"Recipient Address"}
          value={state.receipientAddress}
          className="outline-0 appearance-none border-0 focus-visible:ring-0 placeholder:text-sm"
          onChange={(e) => dispatch({ receipientAddress: e.target.value })}
          onPaste={onPasteAddress}
        />

        <button
          type="button"
          className="cursor-pointer"
          onClick={() => onPasteAddress()}
        >
          <ClipboardIcon className="size-4 text-neutral-gray-400" />
        </button>
      </div>

      <FormInputControl
        value={state.amount}
        max={Number(currentAssetInfo.balance)}
        onValueChange={(amount) => dispatch({ amount })}
        placeholder="0.00"
        label="Amount"
        trailing={
          <span
            className={cn("text-sm text-neutral-gray-400 font-medium", {
              "text-white": !!state.amount,
            })}
          >
            {currentAssetInfo.symbol}
          </span>
        }
      />

      <Summary className="mb-1">
        <SummaryItem
          label="Available Balance"
          value={`${currentAssetInfo.balance} ${currentAssetInfo.symbol}`}
        />
        <SummaryItem
          label="Minimum withdraw"
          value={`${currentAssetInfo.minAmount} ${currentAssetInfo.symbol}`}
        />
        <SummaryItem
          label="Estimated time"
          value={
            unitFees?.withdrawEta ??
            currentNetworkInfo.withdrawalEta ??
            "Instant"
          }
        />
        <SummaryItem
          label="Network fee"
          value={`${withdrawFee + " " + currentAssetInfo.symbol}`}
        />
      </Summary>

      <div className="flex items-start gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 rounded-md p-2">
        <AlertTriangleIcon className="size-3.5 shrink-0 mt-0.5" />
        <p>
          Withdrawing to a wrong address will result in permanent loss of funds.
        </p>
      </div>

      <ConnectButton
        className="w-full"
        disabled={label.disabled || state.processing}
        loading={state.processing}
        label={label.text}
        onClick={withdraw}
      />
    </div>
  );
};

export default WithdrawTab;
