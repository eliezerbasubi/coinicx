"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { OrderBookLayout, OrderBookLayoutStyle } from "@/types/orderbook";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { Button } from "@/components/ui/button";
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

type Props = {
  layoutStyle?: OrderBookLayoutStyle;
  className?: string;
};

export const OrderBookSelector = ({
  layoutStyle = "inline",
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1 py-2 px-4",
        className,
      )}
    >
      <OrderBookLayoutSelector layoutStyle={layoutStyle} />

      <OrderBookDepthSelector layoutStyle={layoutStyle} />
    </div>
  );
};

export const OrderBookLayoutSelector = ({ layoutStyle, className }: Props) => {
  const layout = useShallowOrderBookStore((s) => s.layout);

  const onLayoutChange = (layout: OrderBookLayout, index: number) => {
    if (layoutStyle === "inline") {
      useOrderBookStore.getState().setLayout(layout);
    } else {
      // Toggle between layouts
      const nextIndex = (index + 1) % LAYOUTS.length;
      useOrderBookStore.getState().setLayout(LAYOUTS[nextIndex].value);
    }
  };

  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      {LAYOUTS.map((item, index) => (
        <button
          key={item.value}
          onClick={() => onLayoutChange(item.value, index)}
          className={cn("outline-none opacity-50 transition-opacity", {
            "opacity-100": item.value === layout,
            hidden: layoutStyle === "stacked" && item.value !== layout,
          })}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export const OrderBookDepthSelector = ({ layoutStyle, className }: Props) => {
  const [open, setOpen] = useState(false);

  const { tickSize, ticks } = useShallowOrderBookStore((s) => ({
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
    <AdaptivePopover
      open={open}
      onOpenChange={setOpen}
      title="Orderbook Depth"
      className="w-full md:w-32 md:p-0"
      align="end"
      collisionPadding={0}
      sideOffset={10}
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "w-24 h-fit p-1 flex items-center justify-between shrink-0 text-neutral-300 text-xs font-semibold",
            { "flex-1 h-5 text-3xs": layoutStyle === "stacked" },
            className,
          )}
        >
          <span className="mx-1">{currentTick?.label}</span>
          <ChevronDown
            className={cn("size-4 stroke-3", {
              "size-3": layoutStyle === "stacked",
            })}
          />
        </Button>
      }
    >
      {ticks.map((tick) => {
        const isActive =
          tickSize === null
            ? ticks[0].value === tick.value
            : tick.value === tickSize;
        return (
          <div
            key={tick.value}
            role="button"
            tabIndex={0}
            onKeyDown={() => null}
            onClick={() => onTickSizeChange(tick.value)}
            className={cn(
              "flex items-center justify-between space-x-2 p-2 cursor-pointer hover:bg-neutral-gray-200 text-neutral-gray-400",
              {
                "text-white md:bg-neutral-gray-200": isActive,
              },
            )}
          >
            <p className="text-sm font-semibold">{tick.label}</p>
            {isActive && (
              <Check className="size-3 stroke-4 text-neutral-300 shrink-0" />
            )}
          </div>
        );
      })}
    </AdaptivePopover>
  );
};
