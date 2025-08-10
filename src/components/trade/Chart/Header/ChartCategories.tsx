import React from "react";

import { ChartInterval, ChartType } from "@/types/trade";
import { cn } from "@/utils/cn";

import ChartTimeInterval from "./ChartTimeInterval";

type Props = {
  interval?: ChartInterval;
  value?: ChartType;
  onIntervalChange?: (value: ChartInterval) => void;
  onValueChange?: (value: ChartType) => void;
};

const CATEGORIES: Array<{ label: string; value: ChartType }> = [
  { label: "Standard", value: "standard" },
  { label: "Trading View", value: "tradingView" },
  { label: "Depth", value: "depth" },
];

const ChartCategories = ({
  value,
  interval,
  onIntervalChange,
  onValueChange,
}: Props) => {
  return (
    <div className="w-full border-b border-neutral-gray-200 px-4 h-10 flex items-center">
      <div className="w-full grid grid-cols-[auto_min-content] items-center">
        <div className="w-full">
          {value === "standard" && (
            <ChartTimeInterval
              value={interval}
              onValueChange={onIntervalChange}
            />
          )}
        </div>

        <div className="flex items-center gap-4 whitespace-nowrap">
          {CATEGORIES.map((category) => (
            <div
              key={category.value}
              role="button"
              tabIndex={0}
              aria-selected={category.value === value}
              className={cn(
                "text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
                {
                  "text-white": category.value === value,
                },
              )}
              onClick={() => onValueChange?.(category.value)}
            >
              {category.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartCategories;
