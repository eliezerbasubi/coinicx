import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useTradeContext } from "@/features/trade/store/hooks";

type Props = {
  className?: string;
};

const OrderBookTicker = ({ className }: Props) => {
  const tokenCtx = useTradeContext((state) => state.assetCtx);

  const close = Number(tokenCtx.prevDayPx);
  const open = Number(tokenCtx.markPx);

  const isBuyOrder = close > open;

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center md:justify-start flex-wrap py-2 lg:py-3 px-4 gap-x-2",
        className,
      )}
    >
      <div className="flex items-center">
        <p
          className={cn("text-sm md:text-base lg:text-xl text-buy font-bold", {
            "text-sell": !isBuyOrder,
          })}
        >
          {formatNumber(close, {
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <ArrowUp
          key="arrow"
          className={cn("text-buy size-4 sm:size-5 rotate-180", {
            "text-sell": !isBuyOrder,
          })}
        />
      </div>
      <p className="text-3xs md:text-sm text-neutral-gray-400">
        {formatNumber(close, {
          style: "currency",
          useFallback: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
};

export default OrderBookTicker;
