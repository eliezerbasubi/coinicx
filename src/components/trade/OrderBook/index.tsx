import React from "react";

import OrderBookHeader from "./OrderBookHeader";
import OrderBookSettings from "./OrderBookSettings";
import OrderBookTable from "./OrderBookTable";

type Props = {};

const OrderBook = (props: Props) => {
  return (
    <div className="w-full h-full flex flex-col max-w-80 bg-primary-dark rounded-md">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
        <p className="text-sm font-semibold">Order Book</p>

        <OrderBookSettings />
      </div>

      <OrderBookHeader />
      <OrderBookTable />
    </div>
  );
};

export default OrderBook;
