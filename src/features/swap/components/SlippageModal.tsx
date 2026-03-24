import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useIsMobile } from "@/hooks/useIsMobile";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";

import { MAX_SLIPPAGE, MIN_HIGH_SLIPPAGE, MIN_SLIPPAGE } from "../constants";
import { useShallowSwapStore } from "../store";

type Props = {
  open: boolean;
  triggerRef?: React.Ref<HTMLElement>;
  onOpenChange?: (open: boolean) => void;
};

const SLIPPAGE_PERCENTAGES = [0.1, 0.5, 1];

const SlippageModal = (props: Props) => {
  const { slippage, setSlippage } = useShallowSwapStore((s) => ({
    slippage: s.slippage,
    setSlippage: s.setSlippage,
  }));

  const [value, setValue] = useState("");
  const isMobile = useIsMobile();

  const isHighSlippage = parseFloat(value) > MIN_HIGH_SLIPPAGE;

  const onValueChange = (value: string) => {
    const parsedValue = parseFloat(value);

    if (
      parsedValue &&
      (parsedValue < MIN_SLIPPAGE || parsedValue > MAX_SLIPPAGE)
    )
      return;

    setValue(value);

    if (parsedValue) {
      setSlippage(parsedValue);
    }
  };

  const onPresetClick = (percent: number) => {
    setSlippage(percent);
    setValue("");
  };

  return (
    <AdaptivePopover
      {...props}
      collisionBoundary={document.querySelector("div#swap-container")}
      collisionPadding={{ right: 8 }}
      className="w-full md:w-80 mt-4 rounded-t-2xl md:rounded-2xl"
    >
      <div className="w-full mt-2 md:mt-0">
        <div className="w-full mb-3">
          <p className="text-sm font-semibold text-white">Slippage Tolerance</p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            Higher slippage increases success but may worsen price.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {SLIPPAGE_PERCENTAGES.map((percent) => (
            <Button
              key={percent}
              size="sm"
              variant="default"
              className={cn(
                "bg-neutral-gray-600 text-white hover:bg-primary/10  hover:text-primary",
                {
                  "bg-primary/10 text-primary": slippage === percent && !value,
                },
              )}
              onClick={() => onPresetClick(percent)}
            >
              {percent.toFixed(1)}%
            </Button>
          ))}
        </div>

        <InputNumberControl
          label="Custom Slippage"
          max={MAX_SLIPPAGE}
          value={value}
          placeholder="0.0"
          onValueChange={onValueChange}
          className="text-sm"
          trailing={
            <p className="text-neutral-gray-400 text-sm font-medium">%</p>
          }
        />
        <div
          className={cn("grid grid-rows-[0fr] duration-300", {
            "grid-rows-[1fr]": !!isHighSlippage,
          })}
        >
          <div
            className={cn(
              "overflow-hidden opacity-0 duration-300 text-sm font-medium text-red-500",
              {
                "opacity-100": !!isHighSlippage,
              },
            )}
          >
            <div className="flex items-center gap-1 mt-2">
              <TriangleAlert className="size-4" />
              <p>Very high slippage</p>
            </div>
          </div>
        </div>
        {isMobile && (
          <Button
            type="button"
            label="Done"
            className="w-full mt-3"
            onClick={() => props.onOpenChange?.(false)}
          />
        )}
      </div>
    </AdaptivePopover>
  );
};

export default SlippageModal;
