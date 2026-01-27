import React, { useMemo } from "react";

import { cn } from "@/utils/cn";

type Props = {
  value: number;
  onValueChange?: (value: number) => void;
};

const OrderFormSlider = ({ value, onValueChange }: Props) => {
  const tooltipXPosition = useMemo(() => {
    if (value <= 10) return -11;
    if (value < 20) return -15;
    if (value >= 20 && value < 30) return -16;
    if (value >= 30 && value <= 50) return -19;
    if (value > 50 && value <= 70) return -23;
    if (value > 70 && value <= 99) return -27;
    return -33;
  }, [value]);

  return (
    <div className="w-full">
      <div className="group/slider relative flex items-center justify-center">
        <input
          type="range"
          role="slider"
          aria-label="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-valuetext="0 units"
          max={100}
          min={0}
          className="flex-1 my-1 appearance-none outline-none bg-transparent relative z-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:bg-primary-dark [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:ring-4 [&::-webkit-slider-thumb]:hover:ring-primary/30 [&::-webkit-slider-thumb]:hover:cursor-grab"
          value={value}
          onChange={({ target: { valueAsNumber } }) =>
            onValueChange?.(valueAsNumber)
          }
        />
        <div className="w-[calc(100%-1px)] flex justify-between h-1 bg-neutral-gray-200 absolute top-[calc(50%-2px)] z-1">
          {/* Track */}
          <div
            className="absolute inset-0 bg-primary rounded-full"
            style={{ width: `${value}%` }}
          />

          <div
            role="tooltip"
            className="absolute -top-11 z-10 hidden group-hover/slider:block"
            style={{ left: `${value}%` }}
          >
            <div
              className="w-fit bg-neutral-gray-300 rounded-md p-2 flex flex-col items-center justify-center"
              style={{ transform: `translateX(${tooltipXPosition}px)` }}
            >
              <p className="text-xs font-semibold lining-nums tabular-nums">
                {value}%
              </p>

              <span className="absolute -bottom-[5px] border-5 border-b-0 border-transparent border-t-neutral-gray-300" />
            </div>
          </div>

          {/* Track snap points */}
          {Array.from({ length: 5 }).map((_, index) => {
            const progress = 25 * index;

            return (
              <div
                key={index}
                className={cn(
                  "relative -top-1 size-3 rounded-full bg-primary-dark border-3 border-neutral-gray-200",
                  { "border-primary": progress <= value },
                )}
              />
            );
          })}
        </div>
      </div>
      <div className="w-full hidden justify-between items-center text-xs text-neutral-gray-400 font-semibold">
        <p>0</p>
        <p>100%</p>
      </div>
    </div>
  );
};

export default OrderFormSlider;
