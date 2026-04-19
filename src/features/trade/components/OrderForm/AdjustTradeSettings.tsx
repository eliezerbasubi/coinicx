import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useWebHaptics } from "web-haptics/react";

import {
  useShallowUserTradeStore,
  useUserTradeStore,
} from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { useAgentClient } from "@/hooks/useAgentClient";
import { useIsMobile } from "@/hooks/useIsMobile";
import ConnectButton from "@/components/common/ConnectButton";
import FormInputSlider from "@/components/common/FormInputSlider";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Button } from "@/components/ui/button";
import { InputNumber } from "@/components/ui/input-number";
import { useTradeContext } from "@/features/trade/store/hooks";

import LeverageDiscreteSlider from "./LeverageDiscreteSlider";

const toastId = "adjust-leverage";

const AdjustTradeSettings = () => {
  const { address } = useAccount();
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  if (!isPerps) return null;

  return (
    <div className="w-full flex items-center gap-2 md:px-4 md:h-10 mb-1 md:mb-0">
      <AdjustMarginMode />
      <AdjustLeverage key={address} />
      {/* User Account unification mode */}
      <Button
        variant="secondary"
        size="sm"
        className="h-6 md:h-7 px-2 md:px-3 flex-1 bg-neutral-gray-600 text-neutral-gray-400 text-3xs md:text-xs"
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
  const { getAgentClient } = useAgentClient();
  const haptic = useWebHaptics();

  const { marginMode, leverage } = useShallowUserTradeStore((s) => ({
    marginMode: s.activeAssetData?.leverage?.type ?? "cross",
    leverage: s.activeAssetData?.leverage?.value ?? -1,
  }));
  const assetId = useTradeContext((s) => s.assetMeta.assetId ?? -1);

  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const onAdjustMarginMode = async (value: string) => {
    if (value === marginMode) {
      setOpen(false);
      return;
    }

    try {
      if (assetId === -1) throw new Error("Asset is not available");
      if (leverage === -1) throw new Error("Leverage is not available");

      setProcessing(true);

      const exchClient = await getAgentClient();

      toast.loading("Adjusting margin mode", {
        id: toastId,
      });

      const type = value as "cross" | "isolated";

      await exchClient.updateLeverage({
        asset: assetId,
        isCross: type === "cross",
        leverage,
      });

      useUserTradeStore.getState().updateLeverage({ type });

      setOpen(false);

      toast.success("Margin mode adjusted successfully", {
        id: toastId,
      });

      haptic.trigger("success");
    } catch (error) {
      let message = "Failed to adjust margin mode";

      if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message, {
        id: toastId,
      });

      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdaptivePopover
      open={open}
      onOpenChange={setOpen}
      className="p-0"
      align="start"
      collisionPadding={16}
      title={<span className="px-4 md:px-0">Margin Mode</span>}
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="h-6 md:h-7 px-2 md:px-3 flex-1 text-white text-3xs md:text-xs capitalize"
        >
          {marginMode}
        </Button>
      }
    >
      {LEVERAGE_MARGIN_MODES.map((option) => (
        <button
          key={option.value}
          disabled={processing}
          className={cn(
            "w-full text-left px-4 py-2 hover:bg-neutral-gray-200 outline-0 disabled:pointer-events-none disabled:cursor-not-allowed",
            {
              "bg-neutral-gray-200": marginMode === option.value,
            },
          )}
          onClick={() => onAdjustMarginMode(option.value)}
        >
          <p className="text-sm font-medium text-white">{option.title}</p>
          <p className="text-xs font-medium text-neutral-gray-400 mt-1 md:mt-0">
            {option.description}
          </p>
        </button>
      ))}
    </AdaptivePopover>
  );
};

const AdjustLeverage = () => {
  const { getAgentClient } = useAgentClient();
  const haptic = useWebHaptics();

  const leverage = useShallowUserTradeStore((s) =>
    (s.activeAssetData?.leverage?.value ?? 40).toString(),
  );
  const { maxLeverage, assetId } = useTradeContext((s) => ({
    maxLeverage: s.assetMeta?.maxLeverage ?? 40,
    assetId: s.assetMeta?.assetId ?? -1,
  }));

  const [open, setOpen] = useState(false);
  const [assetLeverage, setAssetLeverage] = useState(leverage);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setAssetLeverage(leverage);
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

  const onAdjustLeverage = async () => {
    if (assetLeverage === leverage) {
      setOpen(false);
      return;
    }

    try {
      if (assetId === -1) throw new Error("Asset is not available");

      setProcessing(true);

      const exchClient = await getAgentClient();

      toast.loading("Adjusting leverage", {
        id: toastId,
      });

      await exchClient.updateLeverage({
        asset: assetId,
        isCross:
          useUserTradeStore.getState().activeAssetData?.leverage?.type ===
          "cross",
        leverage: assetLeverage,
      });

      useUserTradeStore
        .getState()
        .updateLeverage({ value: Number(assetLeverage) });

      setOpen(false);

      toast.success("Leverage adjusted successfully", {
        id: toastId,
      });

      haptic.trigger("success");
    } catch (error) {
      let message = "Failed to adjust leverage";

      if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message, {
        id: toastId,
      });

      haptic.trigger("error");
    } finally {
      setProcessing(false);
    }
  };

  const onDirectionClick = (direction: "increase" | "decrease") => {
    haptic.trigger("medium");

    const multiplier = direction === "increase" ? 1 : -1;
    const newValue = Number(assetLeverage) + multiplier;
    onValueChange(newValue.toString());
  };

  return (
    <AdaptivePopover
      open={open}
      onOpenChange={setOpen}
      title="Adjust Leverage"
      className="gap-0"
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="h-6 md:h-7 px-2 md:px-3 flex-1 text-white text-3xs md:text-xs capitalize"
        >
          {leverage}x
        </Button>
      }
    >
      <div className="w-full pt-4 md:pt-0">
        <p className="text-white text-sm hidden sm:block font-medium mb-2">
          Adjust Leverage
        </p>
        <div className="flex items-center justify-between md:mb-4">
          <ChevronLeft
            role="button"
            tabIndex={0}
            className="outline-0 hover:text-white"
            onClick={() => onDirectionClick("decrease")}
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
            onClick={() => onDirectionClick("increase")}
          />
        </div>
        <LeverageSlider
          maxLeverage={maxLeverage}
          value={assetLeverage}
          onValueChange={onValueChange}
        />

        <ConnectButton
          variant="default"
          size="sm"
          className="w-full mt-4 h-10 md:h-8"
          label="Confirm"
          disabled={processing}
          loading={processing}
          onClick={onAdjustLeverage}
        />
      </div>
    </AdaptivePopover>
  );
};

type LeverageProps = {
  maxLeverage: number;
  value: string;
  onValueChange?: (value: string) => void;
};

const LeverageSlider = ({
  maxLeverage,
  value,
  onValueChange,
}: LeverageProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <LeverageDiscreteSlider
        maxLeverage={maxLeverage}
        value={value}
        onValueChange={onValueChange}
      />
    );
  }

  return (
    <FormInputSlider
      value={Math.floor((Number(value) / maxLeverage) * 100)}
      min={1}
      onValueChange={(value) => {
        onValueChange?.(Math.floor((value / 100) * maxLeverage).toString());
      }}
    />
  );
};

export default AdjustTradeSettings;
