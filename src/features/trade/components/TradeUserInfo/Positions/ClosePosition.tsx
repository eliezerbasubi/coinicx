import React, { useMemo, useReducer, useState } from "react";

import { Position } from "@/types/trade";
import FormInputControl from "@/components/common/FormInputControl";
import TradingButton from "@/components/common/TradingButton";
import Visibility from "@/components/common/Visibility";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClosePosition } from "@/features/trade/hooks/useClosePosition";
import { useFeeRate } from "@/features/trade/hooks/useUserFees";
import { formatPriceToDecimal, roundToDecimals } from "@/features/trade/utils";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

type Props = {
  position: Position;
  trigger: React.ReactNode;
};

type State = {
  size: string;
  limitPrice: string;
  currentTab: "market" | "limit";
};

const TABS = [
  { label: "Market", value: "market" },
  { label: "Limit", value: "limit" },
] as const;

const getMidPrice = (midPx: string, pxDecimals: number) => {
  const mid = Number(midPx);

  return roundToDecimals(mid, pxDecimals, "floor").toString();
};

const ClosePosition = ({ position, trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title={`Close Position (${position.coin})`}
      trigger={trigger}
      className="gap-1"
    >
      <ClosePositionContent
        position={position}
        onSuccess={() => setOpen(false)}
      />
    </AdaptiveDialog>
  );
};

type ClosePositionContent = {
  position: Position;
  onSuccess?: () => void;
};

const ClosePositionContent = ({
  position,
  onSuccess,
}: ClosePositionContent) => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      size: position.szi,
      limitPrice: getMidPrice(position.midPx, position.pxDecimals),
      currentTab: "market",
    },
  );

  const { processing, closePosition } = useClosePosition({
    onSuccess,
  });

  const isMarket = state.currentTab === "market";
  const feeRate = useFeeRate({ isMarket });

  const entryPrice = Number(position.entryPx);
  const markPrice = Number(position.markPx);
  const closeSize = Math.abs(Number(state.size));
  const closePrice =
    state.currentTab === "market" ? markPrice : Number(state.limitPrice);

  // Estimated values
  const closeValue = closeSize * closePrice;
  const estimatedFee = closeValue * feeRate;

  const rawPnl = position.isLong
    ? (closePrice - entryPrice) * closeSize
    : (entryPrice - closePrice) * closeSize;

  const estimatedNetPnl = rawPnl - estimatedFee;

  // Limit price validation: prevent closing at a price >10% unfavorable vs mark
  const limitPriceWarning = useMemo(() => {
    if (state.currentTab !== "limit") return null;
    const limitPrice = Number(state.limitPrice);
    if (!limitPrice || !markPrice) return null;

    // Limit price is more than 10% below the mark price
    if (position.isLong && limitPrice < markPrice * 0.9) {
      return "Price 10% below current price";
    }
    // Limit price is more than 10% above the mark price
    if (!position.isLong && limitPrice > markPrice * 1.1) {
      return "Price 10% above current price";
    }
    return null;
  }, [state.currentTab, state.limitPrice, position.isLong, markPrice]);

  const disabled =
    !parseFloat(state.size) ||
    (state.currentTab === "limit" && !parseFloat(state.limitPrice)) ||
    !!limitPriceWarning ||
    processing;

  const onMidClick = () => {
    dispatch({
      limitPrice: getMidPrice(position.midPx, position.pxDecimals),
    });
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
        className="w-full h-11! shrink-0 space-x-0 md:space-x-2 justify-start"
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
            <p className="text-sm text-neutral-gray-400">Entry Price</p>
            <p className="text-sm text-white font-medium">
              {formatPriceToDecimal(
                Number(position.entryPx),
                position.pxDecimals,
              )}
            </p>
          </div>
          <div className="w-full flex items-center justify-between">
            <p className="text-sm text-neutral-gray-400">Mark Price</p>
            <p className="text-sm text-white font-medium">
              {formatPriceToDecimal(
                Number(position.markPx),
                position.pxDecimals,
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
                    {position.quote}
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
              onValueChange={(value) => dispatch({ limitPrice: value })}
            />
          </Visibility>

          <FormInputControl
            label="Size"
            trailing={<p className="font-medium">{position.coin}</p>}
            value={state.size}
            onValueChange={(value) => dispatch({ size: value })}
            max={position.szi}
          />
        </div>

        <div className="w-full space-y-1 bg-neutral-gray-200 p-2 rounded-lg mb-1">
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-gray-400 font-medium">
              Expected {estimatedNetPnl >= 0 ? "profit" : "loss"}
            </p>
            <p
              className={cn("text-xs text-buy font-medium", {
                "text-sell": estimatedNetPnl < 0,
              })}
            >
              {formatNumber(estimatedNetPnl, {
                style: "currency",
                showSign: true,
              })}
            </p>
          </div>
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-gray-400 font-medium">Fees</p>
            <p className="text-xs text-white font-medium">
              {formatNumber(estimatedFee, { style: "currency" })}
            </p>
          </div>
        </div>

        <TradingButton
          label={limitPriceWarning || "Confirm"}
          disabled={disabled}
          loading={processing}
          onClick={() =>
            closePosition({
              positions: [position],
              closeBy: state.currentTab,
              limitPrice: state.limitPrice,
              size: state.size,
            })
          }
        />
      </div>
    </Tabs>
  );
};

export default ClosePosition;
