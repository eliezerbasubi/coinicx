import React, { useState } from "react";

import { cn } from "@/utils/cn";

const TABS = [
  { label: "Open Orders", value: "openOrders", counter: true },
  { label: "Order History", value: "orderHistory" },
  { label: "Trade History", value: "tradeHistory" },
];

const TradeUserInfo = () => {
  const [currentTab, setCurrentTab] = useState("openOrders");
  return (
    <div className="w-full bg-primary-dark md:rounded-md">
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="w-full h-11 border-b border-neutral-gray-200 px-4 flex items-center gap-x-4 overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab, index) => {
          const selected = currentTab === tab.value;

          return (
            <div
              key={tab.value}
              role="tab"
              id={`trd-info-tab-item-${index}`}
              aria-controls={`trd-info-tab-item-${index}`}
              aria-selected={selected}
              tabIndex={selected ? 1 : -1}
              onClick={() => setCurrentTab(tab.value)}
              className={cn(
                "h-full flex items-center text-neutral-gray-400 text-sm font-medium border-b-2 border-transparent transition-colors cursor-pointer whitespace-nowrap",
                {
                  "border-primary text-white": selected,
                },
              )}
            >
              {tab.label}
              {tab.counter && ` (0)`}
            </div>
          );
        })}
      </div>

      <div role="tabpanel" className="h-64 flex items-center justify-center">
        <p className="text-sm">
          Please <span className="text-primary">connect</span> your wallet
          first.
        </p>
      </div>
    </div>
  );
};

export default TradeUserInfo;
