import React from "react";

import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";

import { TRADE_TYPES } from "../constants";

const TradeTypeTab = () => {
  const tradeType = useTradeContext((s) => s.tradeType);
  const onTradeTypeChange = useTradeContext((s) => s.onTradeTypeChange);

  return (
    <div className="w-full p-4 flex items-center gap-4 whitespace-nowrap border-b border-neutral-gray-200">
      {TRADE_TYPES.map((type) => (
        <div
          key={type.value}
          role="button"
          tabIndex={0}
          aria-selected={type.value === tradeType}
          className={cn(
            "text-sm text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            {
              "text-white": type.value === tradeType,
            },
          )}
          onClick={() => onTradeTypeChange(type.value)}
        >
          {type.label}
        </div>
      ))}
    </div>
  );
};

export default TradeTypeTab;
