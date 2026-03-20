"use client";

import { memo } from "react";

import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { OrderBookType } from "@/lib/types/orderbook";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import { formatPriceToDecimal } from "@/features/trade/utils";

type OrderBookTableRowProps = {
  side: OrderBookType;
  price: number;
  amount: number;
  progress: number;
  decimals: number | null;
  style?: React.CSSProperties;
  className?: string;
  rounding?: boolean;
  hideCumulativeTotal?: boolean;
  onMouseEnter?: () => void;
};

const OrderBookTableRow = ({
  price,
  amount,
  decimals,
  side,
  progress,
  style,
  className,
  rounding,
  hideCumulativeTotal,
  onMouseEnter,
}: OrderBookTableRowProps) => {
  const total = price * amount;

  return (
    <div
      className={cn(
        "w-full relative isolate overflow-hidden flex items-center justify-between text-3xs md:text-xs py-0.5 md:px-4 border-dashed border-neutral-gray-200 hover:bg-neutral-gray-200/25 cursor-pointer",
        {
          "peer/ask peer-hover/ask:bg-neutral-gray-200/25 hover:border-t":
            side === "asks",
          "peer/bid group-hover/bid:bg-neutral-gray-200/25 peer-hover/bid:bg-transparent hover:border-b":
            side === "bids",
        },
        className,
      )}
      style={style}
      onMouseEnter={onMouseEnter}
      onClick={() => {
        useOrderFormStore
          .getState()
          .setExecutionOrder({ limitPrice: price.toFixed(decimals || 0) });
      }}
    >
      <p className={cn("flex-1 text-buy", { "text-sell": side === "asks" })}>
        {formatPriceToDecimal(price, decimals)}
      </p>
      <p className="text-right flex-1">
        {formatNumber(amount, { maximumFractionDigits: 5 })}
      </p>
      <Visibility visible={!hideCumulativeTotal}>
        <p className="text-right flex-1">
          {formatNumber(total, {
            // We limit fraction digits to 2 from thousands and above
            maximumFractionDigits: rounding && total >= 1e3 ? 2 : 5,
            notation: rounding ? "compact" : undefined,
          })}
        </p>
      </Visibility>

      {/* Progress */}
      <div
        style={{ transform: `translateX(${progress * -100}%)` }}
        className={cn(
          "absolute -z-10 inset-0 translate-x-full bg-buy/20 transition-transform duration-500",
          {
            "bg-sell/20": side === "asks",
          },
        )}
      />
    </div>
  );
};

export default memo(OrderBookTableRow);
