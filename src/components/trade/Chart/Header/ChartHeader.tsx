import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { ChartAreaTabValue } from "@/types/trade";
import Visibility from "@/components/common/Visibility";
import { cn } from "@/utils/cn";

const TABS: Array<{
  label: string;
  value: ChartAreaTabValue;
  mobileOnly?: boolean;
}> = [
  { label: "Chart", value: "chart" },
  { label: "Order Book", value: "orderbook", mobileOnly: true },
  { label: "Info", value: "info" },
  { label: "Trading Data", value: "tradingData" },
  { label: "Trading Analysis", value: "tradingAnalysis" },
];

type Props = {
  currentTab: ChartAreaTabValue;
  fullscreen?: boolean;
  onTabChange?: (value: ChartAreaTabValue) => void;
  onFullScreen?: () => void;
};

const ChartHeader = ({
  currentTab,
  fullscreen,
  onTabChange,
  onFullScreen,
}: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  return (
    <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="h-full flex items-center gap-x-4 overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab, index) => {
          const selected = currentTab === tab.value;

          if (!isMobile && tab.mobileOnly) return null;

          return (
            <div
              key={tab.value}
              role="tab"
              id={`btn-tab-item-${index}`}
              aria-controls={`btn-tab-item-${index}`}
              aria-selected={selected}
              tabIndex={selected ? 1 : -1}
              onClick={() => onTabChange?.(tab.value)}
              className={cn(
                "h-full flex items-center text-neutral-gray-400 text-sm font-medium border-b-2 border-transparent transition-colors cursor-pointer whitespace-nowrap",
                {
                  "border-primary text-white": selected,
                },
              )}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      <Visibility visible={!isMobile}>
        <button
          className="text-neutral-gray-400 hover:text-gray-300 [&>svg]:size-4"
          onClick={onFullScreen}
        >
          {fullscreen ? <Minimize2 /> : <Maximize2 />}
        </button>
      </Visibility>
    </div>
  );
};

export default React.memo(ChartHeader);
