import React from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";

import { ChartInterval, ChartType } from "@/types/trade";

import ChartTimeInterval from "../ChartTimeInterval";

const ChartCategoryPopover = dynamic(() => import("./ChartCategoryPopover"));
const ChartCategoryInline = dynamic(() => import("./ChartCategoryInline"));

type Props = {
  interval?: ChartInterval;
  value?: ChartType;
  onIntervalChange?: (value: ChartInterval) => void;
  onValueChange?: (value: ChartType) => void;
};

const ChartCategories = ({
  value,
  interval,
  onIntervalChange,
  onValueChange,
}: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

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

        {isMobile ? (
          <ChartCategoryPopover value={value} onValueChange={onValueChange} />
        ) : (
          <ChartCategoryInline value={value} onValueChange={onValueChange} />
        )}
      </div>
    </div>
  );
};

export default ChartCategories;
