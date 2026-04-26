import React, { useMemo, useReducer, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import FormInputSlider from "@/components/common/FormInputSlider";
import TradingButton from "@/components/common/TradingButton";
import Visibility from "@/components/common/Visibility";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";
import { Summary, SummaryItem } from "@/components/ui/summary";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useClosePosition,
  type ClosingPosition,
} from "@/features/trade/hooks/useClosePosition";
import { useFeeRate } from "@/features/trade/hooks/useUserFees";
import {
  formatPriceToDecimal,
  formatSize,
  parsePriceToFormat,
  roundToDecimals,
} from "@/features/trade/utils";

type Props = {
  variant?: "perps" | "predictions";
  position: ClosingPosition;
  title?: React.ReactNode;
  trigger: React.ReactNode;
};

type State = {
  size: string;
  szPercent: number;
  limitPrice: string;
  currentTab: "market" | "limit";
};

const TABS = [
  { label: "Market", value: "market" },
  { label: "Limit", value: "limit" },
] as const;

const ClosePosition = ({
  position,
  title,
  trigger,
  variant = "perps",
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title={title ?? `Close Position ${position.base && `(${position.base})`}`}
      trigger={trigger}
      className="gap-1"
    >
      <ClosePositionContent
        position={position}
        variant={variant}
        onSuccess={() => setOpen(false)}
      />
    </AdaptiveDialog>
  );
};

type ClosePositionContent = {
  variant: "perps" | "predictions";
  position: ClosingPosition;
  onSuccess?: () => void;
};

const ClosePositionContent = ({
  position,
  variant,
  onSuccess,
}: ClosePositionContent) => {
  const isPrediction = variant === "predictions";
  const midPx = (Number(position.midPx) || Number(position.markPx)).toString();

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      size: Math.abs(Number(position.szi)).toString(),
      szPercent: 100,
      limitPrice: getMidPrice(midPx, position.pxDecimals, isPrediction),
      currentTab: "market",
    },
  );

  const { processing, closePosition } = useClosePosition({
    variant,
    onSuccess,
  });

  const isMarket = state.currentTab === "market";
  const feeRate = useFeeRate({ isMarket });

  const entryPrice = Number(position.entryPx);
  const markPrice = Number(position.markPx);
  const closeSize = Math.abs(Number(state.size));

  const limitPx = parsePriceToFormat(
    state.limitPrice,
    isPrediction ? "toHundredths" : undefined,
  );

  const closePrice = state.currentTab === "market" ? markPrice : limitPx;

  // Estimated values
  const closeValue = closeSize * closePrice;
  const estimatedFee = closeValue * feeRate.total;

  const rawPnl = position.isLong
    ? (closePrice - entryPrice) * closeSize
    : (entryPrice - closePrice) * closeSize;

  const estimatedNetPnl = rawPnl - estimatedFee;

  // Limit price validation: prevent closing at a price >10% unfavorable vs mark
  const limitPriceWarning = useMemo(() => {
    if (state.currentTab !== "limit") return null;
    if (!limitPx || !markPrice) return null;

    // Limit price is more than 10% below the mark price
    if (position.isLong && limitPx < markPrice * 0.9) {
      return "Price 10% below current price";
    }
    // Limit price is more than 10% above the mark price
    if (!position.isLong && limitPx > markPrice * 1.1) {
      return "Price 10% above current price";
    }
    return null;
  }, [state.currentTab, limitPx, position.isLong, markPrice]);

  const disabled =
    !parseFloat(state.size) ||
    (state.currentTab === "limit" && !limitPx) ||
    !!limitPriceWarning ||
    processing;

  const onMidClick = () => {
    dispatch({
      limitPrice: getMidPrice(midPx, position.pxDecimals, isPrediction),
    });
  };

  const onLimitPriceChange = (value: string) => {
    if (isPrediction) {
      const floatVal = parseFloat(value);
      if (floatVal > 99.9 || floatVal < 0) return;

      dispatch({ limitPrice: value });
    } else {
      dispatch({ limitPrice: value });
    }
  };

  return (
    <Tabs
      value={state.currentTab}
      className="h-full gap-0"
      onValueChange={(value) =>
        dispatch({ currentTab: value as State["currentTab"] })
      }
    >
      <TabsList
        variant="line"
        className="w-full shrink-0 space-x-0 md:space-x-2 justify-start"
      >
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-fit flex-0 text-xs font-medium"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="w-full mt-2">
        <div className="space-y-1">
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-gray-400 font-medium">
              Entry Price
            </p>
            <p className="text-xs text-white font-medium">
              {formatPriceToDecimal(
                Number(position.entryPx),
                isPrediction ? 1 : position.pxDecimals,
                {
                  style: isPrediction ? "cent" : undefined,
                  roundingMode: "floor",
                },
              )}
            </p>
          </div>
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-gray-400 font-medium">
              Mark Price
            </p>
            <p className="text-xs text-white font-medium">
              {formatPriceToDecimal(
                Number(position.markPx),
                isPrediction ? 1 : position.pxDecimals,
                {
                  style: isPrediction ? "cent" : undefined,
                  roundingMode: "floor",
                },
              )}
            </p>
          </div>
        </div>

        <div className="w-full space-y-1.5 my-3">
          <Visibility visible={state.currentTab === "limit"}>
            <InputNumberControl
              label="Price"
              value={state.limitPrice}
              trailing={
                <div className="flex items-center gap-x-2">
                  <span className="text-neutral-300 text-sm font-medium">
                    {isPrediction ? "¢" : position.quote}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    className="size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-xs font-semibold"
                    onClick={onMidClick}
                  >
                    Mid
                  </Button>
                </div>
              }
              onValueChange={onLimitPriceChange}
              onKeyDown={(e) => {
                if (!isPrediction) return;

                let currentPrice = Number(state.limitPrice) || 0;
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (currentPrice < 99.9) {
                    currentPrice += 0.1;
                    onLimitPriceChange(currentPrice.toFixed(1));
                  }
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (currentPrice > 0) {
                    currentPrice -= 0.1;
                    onLimitPriceChange(currentPrice.toFixed(1));
                  }
                }
              }}
            />
          </Visibility>

          <InputNumberControl
            label={isPrediction ? "Shares" : "Size"}
            trailing={<p className="font-medium text-sm">{position.base}</p>}
            value={state.size}
            max={Math.abs(Number(position.szi))}
            labelClassName="text-sm"
            className="text-sm"
            onValueChange={(value) => {
              const percent = value
                ? (Number(value) / Math.abs(Number(position.szi))) * 100
                : 0;

              dispatch({
                size: value,
                szPercent: Math.min(Math.floor(percent), 100),
              });
            }}
          />
          <FormInputSlider
            // showLimiters
            value={state.szPercent}
            onValueChange={(percent) => {
              const size = Math.abs(Number(position.szi)) * (percent / 100);
              const sz = formatSize(size, position.szDecimals);
              dispatch({
                szPercent: percent,
                size: percent ? sz : "",
              });
            }}
          />
        </div>

        <Summary className="mb-2">
          <SummaryItem
            label="Expected PNL"
            value={formatNumber(estimatedNetPnl, {
              style: "currency",
              useSign: true,
            })}
            valueClassName={cn("text-buy", {
              "text-sell": estimatedNetPnl < 0,
            })}
          />
          <SummaryItem
            label="Fees"
            value={formatNumber(estimatedFee, { style: "currency" })}
          />
        </Summary>

        <TradingButton
          label={limitPriceWarning || "Confirm"}
          disabled={disabled}
          loading={processing}
          onClick={() =>
            closePosition({
              positions: [position],
              closeBy: state.currentTab,
              limitPrice: limitPx.toString(),
              size: state.size,
            })
          }
        />
      </div>
    </Tabs>
  );
};

export default ClosePosition;

const getMidPrice = (
  midPx: string,
  pxDecimals: number,
  isPrediction: boolean,
) => {
  const mid = parsePriceToFormat(midPx, isPrediction ? "toCents" : undefined);

  const decimals = isPrediction ? 1 : pxDecimals;

  return roundToDecimals(mid, decimals, "floor").toString();
};
