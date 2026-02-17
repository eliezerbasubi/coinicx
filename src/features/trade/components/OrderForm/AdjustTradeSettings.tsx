import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ConnectButton from "@/components/common/ConnectButton";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Button } from "@/components/ui/button";
import InputNumber from "@/components/ui/input-number";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useShallowUserTradeStore,
  useUserTradeStore,
} from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";

import OrderFormSlider from "./OrderFormSlider";

const AdjustTradeSettings = () => {
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  if (!isPerps) return null;

  return (
    <div className="w-full flex items-center gap-2 px-4 h-10">
      <AdjustMarginMode />
      <AdjustLeverage />
      {/* User Account unification mode */}
      <Button
        variant="secondary"
        size="sm"
        className="h-7 flex-1 text-white text-xs"
      >
        Classic
      </Button>
    </div>
  );
};

const LEVERAGE_MARGIN_MODES = [
  {
    title: "Cross",
    description:
      "All cross positions share the same cross margin as collateral. In the event of liquidation, your cross margin balance and any remaining open positions under assets in this mode may be forfeited.",
    value: "cross",
  },
  {
    title: "Isolated",
    description:
      "Manage your risk on individual positions by restricting the amount of margin allocated to each. If the margin ratio of an isolated position reaches 100%, the position will be liquidated. Margin can be added or removed to individual positions in this mode.",
    value: "isolated",
  },
];

const AdjustMarginMode = () => {
  const marginMode = useUserTradeStore((s) => s.leverage?.type ?? "cross");

  const [open, setOpen] = useState(false);

  const onAdjustMarginMode = (value: string) => {
    useUserTradeStore
      .getState()
      .updateLeverage({ type: value as "cross" | "isolated" });

    setOpen(false);
  };

  return (
    <AdaptivePopover
      open={open}
      onOpenChange={setOpen}
      className="p-0"
      align="start"
      collisionPadding={16}
      title="Margin Mode"
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="h-7 flex-1 text-white text-xs capitalize"
        >
          {marginMode}
        </Button>
      }
    >
      {LEVERAGE_MARGIN_MODES.map((option) => (
        <button
          key={option.value}
          className={cn(
            "w-full text-left px-4 py-2 hover:bg-neutral-gray-200 outline-0",
            {
              "bg-neutral-gray-200": marginMode === option.value,
            },
          )}
          onClick={() => onAdjustMarginMode(option.value)}
        >
          <p className="text-sm font-medium text-white">{option.title}</p>
          <p className="text-xs font-medium text-neutral-gray-400">
            {option.description}
          </p>
        </button>
      ))}
    </AdaptivePopover>
  );
};

const AdjustLeverage = () => {
  const leverage = useShallowUserTradeStore((s) => s.leverage?.value ?? 40);
  const maxLeverage = useShallowInstrumentStore(
    (s) => s.assetMeta?.maxLeverage ?? 40,
  );

  const [open, setOpen] = useState(false);
  const [assetLeverage, setAssetLeverage] = useState(leverage.toString());

  useEffect(() => {
    setAssetLeverage(leverage.toString());
  }, [leverage]);

  const onValueChange = (value: string) => {
    const numValue = Number(value);
    if (!value) {
      setAssetLeverage("");
      return;
    }

    if (numValue < 1 || numValue > maxLeverage) return;
    setAssetLeverage(value);
  };

  const onAdjustLeverage = () => {
    useUserTradeStore
      .getState()
      .updateLeverage({ value: Number(assetLeverage) });
    setOpen(false);
  };

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Adjust Leverage"
      className="p-0 gap-0"
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="h-7 flex-1 text-white text-xs capitalize"
        >
          {leverage}x
        </Button>
      }
    >
      <div className="w-full px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <ChevronLeft
            role="button"
            tabIndex={0}
            className="outline-0 hover:text-white"
            onClick={() =>
              onValueChange((Number(assetLeverage) - 1).toString())
            }
          />
          <div className="flex items-center justify-center">
            <InputNumber
              value={assetLeverage}
              name="leverage"
              onChange={(e) => onValueChange(e.target.value)}
              className={cn(
                "max-w-0 min-w-12 text-right bg-transparent appearance-none outline-0 text-3xl font-extrabold text-white",
                { "text-center": !assetLeverage },
              )}
            />
            {assetLeverage && (
              <span className="text-white text-2xl font-bold">x</span>
            )}
          </div>
          <ChevronRight
            role="button"
            tabIndex={0}
            className="outline-0 hover:text-white"
            onClick={() =>
              onValueChange((Number(assetLeverage) + 1).toString())
            }
          />
        </div>
        <OrderFormSlider
          value={Math.floor((Number(assetLeverage) / maxLeverage) * 100)}
          min={1}
          onValueChange={(value) => {
            onValueChange(Math.floor((value / 100) * maxLeverage).toString());
          }}
        />

        <ConnectButton
          variant="default"
          size="sm"
          className="w-full mt-4"
          label="Confirm"
          onClick={onAdjustLeverage}
        />
      </div>
    </AdaptiveDialog>
  );
};

export default AdjustTradeSettings;
