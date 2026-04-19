import { AlertTriangleIcon, PlusCircle } from "lucide-react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import FormInputControl from "@/components/common/FormInputControl";
import TradingButton from "@/components/common/TradingButton";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import {
  Summary,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
} from "@/components/ui/summary";
import { useTransferAndSwap } from "@/features/trade/hooks/useTransferAndSwap";
import { useTradeContext } from "@/features/trade/store/hooks";
import { isUSDCQuote } from "@/features/trade/utils/shared";

const SwapStablecoinModal = () => {
  const { swapModalOpen, openSwapModal, quote } = useTradeContext((s) => ({
    swapModalOpen: s.swapModalOpen,
    quote: s.assetMeta.quote,
    openSwapModal: s.openSwapModal,
  }));

  if (isUSDCQuote(quote)) return null;

  return (
    <AdaptiveDialog
      open={swapModalOpen}
      title="Swap"
      description={
        <span className="text-neutral-gray-400 text-sm">
          Convert USDC to {quote} instantly from your spot and perp balances.
        </span>
      }
      onOpenChange={openSwapModal}
    >
      <SwapStablecoin />
    </AdaptiveDialog>
  );
};

const SwapStablecoin = () => {
  const {
    maxAmount,
    inputAmount,
    outputAmount,
    estimatedFees,
    processing,
    quote,
    base,
    disabled,
    label,
    setInputAmount,
    executeSwap,
  } = useTransferAndSwap();

  return (
    <div className="w-full space-y-2">
      <FormInputControl
        value={inputAmount}
        max={maxAmount}
        label="Amount"
        labelClassName="text-sm"
        trailing={<span className="text-sm font-medium">{base}</span>}
        onValueChange={setInputAmount}
      />

      <Summary className="mb-1">
        <div className="flex items-center justify-between">
          <SummaryLabel>Available Balance</SummaryLabel>
          <SummaryValue
            className="flex items-center gap-x-1 cursor-pointer hover:text-primary"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("deposit")
            }
          >
            <span>
              {formatNumber(maxAmount, {
                symbol: base,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <PlusCircle className="size-3.5 text-primary" />
          </SummaryValue>
        </div>

        <SummaryItem
          label="You will receive"
          value={formatNumber(outputAmount, {
            symbol: quote,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
        <SummaryItem
          label="Fees"
          value={formatNumber(estimatedFees, {
            symbol: quote,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
      </Summary>

      <div className="flex items-start gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 rounded-md p-2">
        <AlertTriangleIcon className="size-3.5 shrink-0 mt-0.5" />
        <p>
          Execution is not guaranteed due to potential slippage in the order
          book.
        </p>
      </div>

      <TradingButton
        label={label}
        loading={processing}
        onClick={executeSwap}
        disabled={disabled}
      />
    </div>
  );
};

export default SwapStablecoinModal;
