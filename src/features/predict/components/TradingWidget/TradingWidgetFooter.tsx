import { useMemo } from "react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TradingButton from "@/components/common/TradingButton";
import Visibility from "@/components/common/Visibility";
import {
  PREDICTIONS_BASE_SZ_DECIMALS,
  PREDICTIONS_QUOTE_ASSET,
} from "@/features/predict/lib/constants/predictions";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { buildSideAssetId } from "@/features/predict/lib/utils/outcomes";
import { useOrderForm } from "@/features/trade/hooks/useOrderForm";
import { usePlaceOrder } from "@/features/trade/hooks/usePlaceOrder";

const TradingWidgetFooter = () => {
  const { marketEvent, marketEventSidesCtx } = useMarketEventContext((s) => {
    const marketEvent =
      s.marketEventMeta.outcomes[s.activeOutcomeIndex] ?? s.marketEventMeta;

    const sidesCtxs =
      s.marketEventCtx.outcomes[s.activeOutcomeIndex]?.sides ??
      s.marketEventCtx.sides;

    return {
      marketEvent,
      marketEventSidesCtx: sidesCtxs,
    };
  });

  const { predictSideIndex, size } = useShallowOrderFormStore((s) => ({
    predictSideIndex: s.predictSideIndex,
    size: s.size,
    isSzNtl: s.settings.isSzInNtl,
  }));

  const sideCtx = marketEventSidesCtx[predictSideIndex];
  const mid = sideCtx?.midPx || sideCtx?.markPx || 0;

  const { disabled, isBuyOrder, hasInsufficientMargin, orderValueAndMargin } =
    useOrderForm({
      spotAsset: { base: marketEvent.coin, quote: PREDICTIONS_QUOTE_ASSET },
      referencePx: mid,
      szDecimals: PREDICTIONS_BASE_SZ_DECIMALS,
      isStableCoin: true,
    });

  const { processing, onPlaceOrder } = usePlaceOrder();

  // TODO: This is not correct, we need to calculate the payout based on the side
  const payout = Number(size || "0");

  const label = useMemo(() => {
    if (hasInsufficientMargin) {
      // Request user to swap USDC to {PREDICTIONS_QUOTE_ASSET}
      if (isBuyOrder) return "Swap";

      // Inform the user they don't have enough shares to sell and disable button
      return "Insufficient Shares";
    }

    return "Trade";
  }, [hasInsufficientMargin, isBuyOrder]);

  const placeOrder = () => {
    if (hasInsufficientMargin && isBuyOrder) {
      return useAccountTransactStore
        .getState()
        .openSwapModal(PREDICTIONS_QUOTE_ASSET);
    }

    const sideCtx = marketEventSidesCtx[predictSideIndex];

    return onPlaceOrder({
      referencePx: (sideCtx?.midPx || sideCtx?.markPx) ?? 0,
      midPx: sideCtx?.midPx ?? 0,
      assetId: buildSideAssetId(marketEvent.outcome, predictSideIndex),
      szDecimals: PREDICTIONS_BASE_SZ_DECIMALS,
      isSpot: true,
      isSzInNtl: false, // Size should not be converted to base size
      base: "Shares",
    });
  };

  const hasEnteredSize = Number(size) > 0;

  return (
    <div className="px-4">
      <div
        className={cn("grid grid-rows-[0fr] duration-300", {
          "grid-rows-[1fr]": hasEnteredSize,
        })}
      >
        <div
          className={cn("overflow-hidden opacity-0 duration-300", {
            "opacity-100": hasEnteredSize,
          })}
        >
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-gray-100 font-medium leading-5">
                Estimated Cost
              </p>
              <p className="text-base font-medium">
                {formatNumber(orderValueAndMargin.orderValue || 0, {
                  style: "currency",
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="block">
                <p className="text-sm text-neutral-gray-100 font-medium leading-5">
                  To Win
                </p>

                <Visibility visible={!!Number(size)}>
                  <p className="text-xs text-neutral-gray-400 font-medium space-x-1">
                    <span>Avg. Price</span>
                    <span>
                      {formatNumber(mid, {
                        style: "cent",
                        roundingMode: "floor",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </p>
                </Visibility>
              </div>
              <p className="text-base md:text-xl font-semibold text-buy">
                {formatNumber(payout, {
                  style: "currency",
                  roundingMode: "floor",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <TradingButton
        disabled={
          (hasInsufficientMargin && !isBuyOrder) || disabled || processing
        }
        loading={processing}
        label={label}
        onClick={placeOrder}
        className="mt-4"
      />
    </div>
  );
};

export default TradingWidgetFooter;
