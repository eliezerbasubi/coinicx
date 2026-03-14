"use client";

import React from "react";

import { OrderBookOrientation } from "@/types/orderbook";
import Visibility from "@/components/common/Visibility";
import { useShallowOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";

import OrderBookList from "./OrderBookList";
import { OrderBookTableHeader } from "./OrderBookTableHeader";
import OrderBookTicker from "./OrderBookTicker";

type Props = Omit<
  React.ComponentProps<typeof OrderBookList>,
  "side" | "className"
> & {
  orientation: OrderBookOrientation;
  className?: string;
  tickerClassName?: string;
  headerClassName?: string;
  listWrapperClassName?: string;
};

const OrderBookTable = ({
  orientation,
  className,
  tickerClassName,
  headerClassName,
  listWrapperClassName,
  ...props
}: Props) => {
  const layout = useShallowOrderBookStore((s) => s.layout);

  return (
    <div className={cn("w-full", className)}>
      <OrderBookTableHeader
        showTotal={!props.hideCumulativeTotal}
        orientation={orientation}
        className={headerClassName}
      />

      <div
        className={cn(
          "w-full px-4 md:px-0 md:h-40 lg:h-auto",
          {
            "grid grid-cols-2 gap-2":
              orientation === "horizontal" && layout === "orderBook",
          },
          listWrapperClassName,
        )}
      >
        <Visibility visible={layout !== "buyOrder"}>
          <OrderBookList
            side="asks"
            {...props}
            orientation={orientation}
            className={cn({ "order-1": orientation === "horizontal" })} // Position bids at the second position in horizontal order
          />
        </Visibility>

        <Visibility visible={orientation === "vertical"}>
          <OrderBookTicker className={tickerClassName} />
        </Visibility>

        <Visibility visible={layout !== "sellOrder"}>
          <OrderBookList
            side="bids"
            className={cn("group/bid", {
              "order-0": orientation === "horizontal", // Position bids at the first position in horizontal order
            })}
            {...props}
            orientation={orientation}
          />
        </Visibility>
      </div>
    </div>
  );
};

export default OrderBookTable;
