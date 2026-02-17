import React from "react";

import { ChartType } from "@/types/trade";
import { cn } from "@/utils/cn";

import { CATEGORIES } from "./constants";

type Props = {
  value?: ChartType;
  onValueChange?: (value: ChartType) => void;
};

const ChartCategoryInline = ({ value, onValueChange }: Props) => {
  return (
    <div className="flex items-center gap-4 whitespace-nowrap">
      {CATEGORIES.map((category) => (
        <div
          key={category.value}
          role="button"
          tabIndex={0}
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
  );
};

export default ChartCategoryInline;
