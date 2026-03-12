import React from "react";

import { OrderBookDisplayOrientation } from "@/types/orderbook";

import OrderBookHeader from "./OrderBookHeader";
import OrderBookSettings from "./OrderBookSettings";
import OrderBookTable from "./OrderBookTable";

type Props = {
  orientation?: OrderBookDisplayOrientation;
};

const OrderBook = ({ orientation }: Props) => {
  return (
    <div className="size-full flex flex-col md:max-w-full lg:max-w-60 xl:max-w-80 bg-primary-dark rounded-md md:overflow-hidden lg:overflow-visible">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 hidden md:flex items-center justify-between">
        <p className="text-sm font-semibold">Order Book</p>

        <OrderBookSettings />
      </div>

      <OrderBookHeader />
      <OrderBookTable orientation={orientation} />
    </div>
  );
};

export default OrderBook;
