import React, { useState } from "react";

import { cn } from "@/utils/cn";

const TABS = [
  { label: "Chart", value: "chart" },
  { label: "Info", value: "info" },
  { label: "Trading Data", value: "tradingData" },
  { label: "Trading Analysis", value: "analysis" },
];

const ChartHeader = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="h-full flex items-center gap-x-4"
      >
        {TABS.map((tab, index) => {
          const selected = currentTab === index;

          return (
            <div
              key={tab.value}
              role="tab"
              id={`btn-tab-item-${index}`}
              aria-controls={`btn-tab-item-${index}`}
              aria-selected={selected}
              tabIndex={selected ? 1 : -1}
              onClick={() => setCurrentTab(index)}
              className={cn(
                "h-full flex items-center text-neutral-gray-400 text-sm font-medium border-b-2 border-transparent transition-colors cursor-pointer",
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
    </div>
  );
};

export default React.memo(ChartHeader);
