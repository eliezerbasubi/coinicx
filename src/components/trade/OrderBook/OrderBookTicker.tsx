import React from "react";
import { ArrowUp } from "lucide-react";

import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

const OrderBookTicker = () => {
  const marketTicker = useTradeContext((state) => state.marketTicker);

  const close = marketTicker?.c ?? 0;
  const open = marketTicker?.o ?? 0;

  const isBuyOrder = close > open;

  return (
    <div className="w-full flex items-center py-3 px-4">
      <p
        className={cn("text-xl text-buy font-bold", {
          "text-sell": !isBuyOrder,
        })}
      >
        {formatNumber(close, { maximumFractionDigits: 2 })}
      </p>
      <ArrowUp
        key="arrow"
        className={cn("text-buy size-5 rotate-180", {
          "text-sell": !isBuyOrder,
        })}
      />
      <p className="text-sm text-neutral-gray-400 ml-2">
        {formatNumber(close, {
          style: "currency",
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
};

export default OrderBookTicker;
