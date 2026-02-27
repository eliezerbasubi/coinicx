import { ArrowUp } from "lucide-react";

import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

const OrderBookTicker = () => {
  const tokenCtx = useShallowInstrumentStore((state) => state.assetCtx);

  const close = Number(tokenCtx?.prevDayPx ?? 0);
  const open = Number(tokenCtx?.markPx ?? 0);

  const isBuyOrder = close > open;

  return (
    <div className="w-full flex items-center py-3 px-4">
      <p
        className={cn("text-xl text-buy font-bold", {
          "text-sell": !isBuyOrder,
        })}
      >
        {formatNumber(close, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
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
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
};

export default OrderBookTicker;
