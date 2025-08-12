import React from "react";

import { ChartInterval } from "@/types/trade";
import { CHART_TIME_INTERVALS } from "@/components/trade/constants";
import { cn } from "@/utils/cn";

type Props = {
  value?: ChartInterval;
  onValueChange?: (interval: ChartInterval) => void;
};

const ChartTimeInterval = ({ value, onValueChange }: Props) => {
  return (
    <div className="flex items-center gap-2">
      {CHART_TIME_INTERVALS.map((interval) => (
        <div
          key={interval.value}
          role="button"
          tabIndex={0}
          className={cn(
            "text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            {
              "text-white": value === interval,
            },
          )}
          onClick={() => onValueChange?.(interval)}
        >
          {interval.label}
        </div>
      ))}
    </div>
  );
};

export default React.memo(
  ChartTimeInterval,
  (prevProps, nextProps) => prevProps.value === nextProps.value,
);
