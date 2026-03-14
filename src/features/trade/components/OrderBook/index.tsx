import React from "react";

import { OrderBookLayoutStyle } from "@/types/orderbook";
import Visibility from "@/components/common/Visibility";
import { cn } from "@/utils/cn";

import OrderBookCompare from "./OrderBookCompare";
import { OrderBookSelector } from "./OrderBookSelector";
import OrderBookSettings from "./OrderBookSettings";
import OrderBookTable from "./OrderBookTable";

type Props = React.ComponentProps<typeof OrderBookTable> & {
  className?: string;
  hideCompare?: boolean;
  hideCompareLabels?: boolean;
  showCompareOnSideLayout?: boolean;
  layoutStyle?: OrderBookLayoutStyle;
};

const OrderBook = ({
  className,
  layoutStyle,
  hideCompare,
  hideCompareLabels,
  showCompareOnSideLayout,
  ...props
}: Props) => {
  return (
    <div
      className={cn(
        "size-full flex flex-col md:max-w-full lg:max-w-60 xl:max-w-80 bg-primary-dark rounded-md md:overflow-hidden lg:overflow-visible",
        className,
      )}
    >
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 hidden md:flex items-center justify-between">
        <p className="text-sm font-semibold">Order Book</p>

        <OrderBookSettings />
      </div>

      <OrderBookSelector layoutStyle={layoutStyle} />
      <OrderBookTable {...props} />

      <Visibility visible={!hideCompare}>
        <OrderBookCompare
          showOnSideLayout={showCompareOnSideLayout}
          hideLabels={hideCompareLabels}
        />
      </Visibility>
    </div>
  );
};

export default OrderBook;
