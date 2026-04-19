import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatWithGrouping } from "@/lib/utils/formatting/normalize-input-number";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useAvailableToTrade } from "@/hooks/useAvailableToTrade";
import FormInputControl from "@/components/common/FormInputControl";
import { Button } from "@/components/ui/button";
import {
  PREDICTIONS_BASE_SZ_DECIMALS,
  PREDICTIONS_QUOTE_ASSET,
  PREDICTIONS_QUOTE_SZ_DECIMALS,
} from "@/features/predict/lib/constants/predictions";
import {
  useActiveOutcomeMeta,
  useActiveOutcomeSideCtx,
} from "@/features/predict/lib/store/market-event/hooks";
import { roundToDecimals } from "@/features/trade/utils";
import { calculateMaxTradeSize } from "@/features/trade/utils/shared";

import AmountCurrencySelector from "./AmountCurrencySelector";

const TradingWidgetOrderSize = () => {
  const { size, isBuyOrder, isSzNtl } = useShallowOrderFormStore((s) => ({
    size: s.size,
    isBuyOrder: s.orderSide === "buy",
    isSzNtl: s.settings.isSzInNtl,
  }));

  const { marketEventMeta } = useActiveOutcomeMeta();

  const availableBalance = useAvailableToTrade({
    isBuyOrder,
    spotAsset: { base: marketEventMeta?.coin, quote: PREDICTIONS_QUOTE_ASSET },
  });

  const { sideCtx } = useActiveOutcomeSideCtx();

  // If buy order and size in ntl, format as currency and show "Amount", else show "Shares"
  const isAmountInUsd = isBuyOrder && isSzNtl;
  const formatStyle = isAmountInUsd ? "currency" : undefined;
  const szDecimals = isSzNtl
    ? PREDICTIONS_QUOTE_SZ_DECIMALS
    : PREDICTIONS_BASE_SZ_DECIMALS;

  const maxTradeSize = calculateMaxTradeSize({
    availableBalance,
    isBuyOrder,
    isSpot: true,
    isSzInNtl: isSzNtl,
    midPx: sideCtx.midPx || sideCtx.markPx || 1,
  });

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <AmountCurrencySelector />
      </div>
      <FormInputControl
        name="amount"
        value={formatWithGrouping(size, "en-US", {
          currency: "USD",
          style: formatStyle,
        })}
        label={
          <div className="flex flex-col gap-y-1">
            <p className="text-sm text-white">
              {isAmountInUsd ? "Amount" : "Shares"}
            </p>
            <Button
              variant="ghost"
              className="p-0 size-fit text-xs text-neutral-gray-400 font-medium gap-1"
              onClick={() => {
                useAccountTransactStore
                  .getState()
                  .openSwapModal(PREDICTIONS_QUOTE_ASSET);
              }}
            >
              <span>{isAmountInUsd ? "Available" : "Max Shares"}:</span>
              <span className={cn({ "text-primary": isBuyOrder })}>
                {formatNumber(maxTradeSize, {
                  style: isAmountInUsd ? "currency" : undefined,
                  minimumFractionDigits: isAmountInUsd ? 2 : 0,
                  maximumFractionDigits: isAmountInUsd ? 2 : 0,
                  roundingMode: "floor",
                })}
              </span>
            </Button>
          </div>
        }
        placeholder={formatNumber(0, {
          style: formatStyle,
          minimumFractionDigits: 0,
        })}
        wrapperClassName="border-none my-2 md:my-4 px-0"
        percentClassName="px-1.5"
        className="text-2xl"
        max={maxTradeSize}
        onValueChange={(value) => {
          useOrderFormStore.getState().onSizeChange({
            size: value,
            isSpot: true,
            midPx: sideCtx.midPx || sideCtx.markPx,
          });
        }}
        onPercentValueChange={(value) =>
          roundToDecimals(value, szDecimals, "floor")
        }
      />
    </div>
  );
};

export default TradingWidgetOrderSize;
