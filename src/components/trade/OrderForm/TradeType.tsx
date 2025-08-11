import React, { useState } from "react";

import { cn } from "@/utils/cn";

const TRADE_TYPES = [
  { label: "Spot", value: "spot" },
  { label: "Cross", value: "cross" },
  { label: "Isolated", value: "isolated" },
];

const TradeType = () => {
  // TODO: Read this data from store
  const [currentType, setCurrentType] = useState("spot");

  return (
    <div className="w-full p-4 flex items-center gap-4 whitespace-nowrap border-b border-neutral-gray-200">
      {TRADE_TYPES.map((trade) => (
        <div
          key={trade.value}
          role="button"
          tabIndex={0}
          aria-selected={trade.value === currentType}
          className={cn(
            "text-sm text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            {
              "text-white": trade.value === currentType,
            },
          )}
          onClick={() => setCurrentType(trade.value)}
        >
          {trade.label}
        </div>
      ))}
    </div>
  );
};

export default TradeType;
