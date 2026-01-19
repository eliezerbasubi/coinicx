import React from "react";

import { TRADE_TYPES } from "@/features/trade/constants";
import { cn } from "@/utils/cn";

const TradeTypeTab = () => {
  // TODO: UPDATE THIS COMPONENT
  // const tradeType = useTradeContext((s) => s.tradeType);

  return (
    <div className="w-full flex px-4 h-11 items-center gap-4 whitespace-nowrap border-b border-neutral-gray-200">
      {TRADE_TYPES.map((type) => (
        <div
          key={type.value}
          role="button"
          tabIndex={0}
          className={cn(
            "h-full flex items-center text-sm text-neutral-gray-400 font-semibold cursor-pointer transition-colors border-b-2 md:border-b-0 border-transparent",
            {
              // "text-white border-primary": type.value === tradeType,
            },
          )}
          // onClick={() => onTradeTypeChange(type.value)}
        >
          {type.label}
        </div>
      ))}
    </div>
  );
};

export default TradeTypeTab;
