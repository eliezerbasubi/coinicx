"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { OrderBookLayout } from "@/types/orderbook";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VOrderBook, VOrderBookType } from "@/components/vectors/orderbook";
import {
  useOrderBookStore,
  useShallowOrderBookStore,
} from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

const LAYOUTS: Array<{
  value: OrderBookLayout;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "orderBook",
    label: "Order Book",
    icon: <VOrderBook className="size-5" />,
  },
  {
    value: "buyOrder",
    label: "Buy Order",
    icon: <VOrderBookType type="buy" className="size-5" />,
  },
  {
    value: "sellOrder",
    label: "Sell Order",
    icon: <VOrderBookType type="sell" className="size-5" />,
  },
];

const OrderBookHeader = () => {
  const [open, setOpen] = useState(false);

  const { layout, tickSize, ticks } = useShallowOrderBookStore((s) => ({
    layout: s.layout,
    tickSize: s.tickSize,
    ticks: s.ticks,
  }));

  const currentTick = useMemo(
    () => ticks.find((tick) => tick.value === tickSize) || ticks[0],
    [tickSize, ticks],
  );

  const onTickSizeChange = (value: number) => {
    useOrderBookStore.getState().onTickSizeChange(value);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between py-2 px-4">
      <div className="flex items-center gap-x-1">
        {LAYOUTS.map((item) => (
          <button
            key={item.value}
            onClick={() => useOrderBookStore.getState().setLayout(item.value)}
            className={cn("outline-none opacity-50 transition-opacity", {
              "opacity-100": item.value === layout,
            })}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-24 p-1 flex items-center justify-between shrink-0 bg-neutral-gray-200 rounded text-neutral-300">
          <span className="text-xs font-semibold mx-1">
            {currentTick?.label}
          </span>
          <ChevronDown className="size-4 stroke-3" />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          collisionPadding={0}
          sideOffset={10}
          className="w-32 px-0 py-1"
        >
          {ticks.map((tick) => {
            return (
              <div
                key={tick.value}
                role="button"
                tabIndex={0}
                onKeyDown={() => null}
                onClick={() => onTickSizeChange(tick.value)}
                className={cn(
                  "flex items-center space-x-2 p-2 cursor-pointer hover:bg-neutral-gray-200",
                  {
                    "bg-neutral-gray-200":
                      tickSize === null
                        ? ticks[0].value === tick.value
                        : tick.value === tickSize,
                  },
                )}
              >
                <p className="text-sm font-semibold text-neutral-300">
                  {tick.label}
                </p>
              </div>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default OrderBookHeader;
