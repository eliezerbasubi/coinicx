"use client";

import { memo } from "react";

import { OrderBookType } from "@/types/orderbook";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

type OrderBookTableRowProps = {
  side: OrderBookType;
  price: number;
  amount: number;
  progress: number;
  style?: React.CSSProperties;
  className?: string;
  onMouseEnter?: () => void;
};

const OrderBookTableRow = ({
  price,
  amount,
  side,
  progress,
  style,
  className,
  onMouseEnter,
}: OrderBookTableRowProps) => {
  const total = price * amount;

  return (
    <div
      className={cn(
        "w-full relative isolate overflow-hidden flex items-center justify-between text-xs py-0.5 md:px-4 border-dashed border-neutral-gray-200 hover:bg-neutral-gray-200/25 cursor-pointer",
        {
          "peer/ask peer-hover/ask:bg-neutral-gray-200/25 hover:border-t":
            side === "asks",
          "peer/bid group-hover/bids:bg-neutral-gray-200/25 peer-hover/bid:bg-transparent hover:border-b":
            side === "bids",
        },
        className,
      )}
      style={style}
      onMouseEnter={onMouseEnter}
    >
      <p className={cn("flex-1 text-buy", { "text-sell": side === "asks" })}>
        {formatNumber(price, { maximumFractionDigits: 2 })}
      </p>
      <p className="text-right flex-1">
        {formatNumber(amount, { maximumFractionDigits: 5 })}
      </p>
      <PriceLevelTotal total={total} />

      {/* Progress */}
      <div
        style={{ transform: `translateX(${progress * -100}%)` }}
        className={cn("absolute -z-10 inset-0 translate-x-full bg-buy/20", {
          "bg-sell/20": side === "asks",
        })}
      />
    </div>
  );
};

const PriceLevelTotal = ({ total }: { total: number }) => {
  const rounding = useOrderBookStore((state) => state.settings.rounding);

  return (
    <p className="text-right flex-1 hidden md:block">
      {formatNumber(total, {
        maximumFractionDigits: 5,
        notation: rounding ? "compact" : undefined,
      })}
    </p>
  );
};

export default memo(OrderBookTableRow);
