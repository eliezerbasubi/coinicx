"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import { OrderBookData, OrderBookLayout } from "@/types/orderbook";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VOrderBook, VOrderBookType } from "@/components/vectors/orderbook";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useOrderBookStore } from "@/store/trade/orderbook";
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

const TICKS = [0.01, 0.1, 1, 10, 50, 100];

const OrderBookHeader = () => {
  const [open, setOpen] = useState(false);

  const onTickSizeChange = useOrderBookStore(
    (selector) => selector.onTickSizeChange,
  );
  const setLayout = useOrderBookStore((selector) => selector.setLayout);

  const layout = useOrderBookStore((selector) => selector.layout);
  const tickSize = useOrderBookStore((selector) => selector.tickSize);

  const queryClient = useQueryClient();

  return (
    <div className="flex items-center justify-between py-2 px-4">
      <div className="flex items-center gap-x-1">
        {LAYOUTS.map((item) => (
          <button
            key={item.value}
            onClick={() => setLayout(item.value)}
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
          <span className="text-xs font-semibold mx-1">{tickSize}</span>
          <ChevronDown className="size-4 stroke-3" />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          collisionPadding={0}
          sideOffset={10}
          className="w-32 px-0 py-1"
        >
          {TICKS.map((tick) => {
            return (
              <div
                key={tick}
                role="button"
                tabIndex={0}
                onKeyDown={() => null}
                onClick={() => {
                  // Load previous data
                  const data = queryClient.getQueryData<OrderBookData>([
                    QUERY_KEYS.orderbook,
                    "BTCUSDT",
                  ]);

                  if (!data) return;

                  onTickSizeChange(tick, data.bids, data.asks);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center space-x-2 p-2 cursor-pointer hover:bg-neutral-gray-200",
                  {
                    "bg-neutral-gray-200": tick === tickSize,
                  },
                )}
              >
                <p className="text-sm font-semibold text-neutral-300">{tick}</p>
              </div>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default OrderBookHeader;
