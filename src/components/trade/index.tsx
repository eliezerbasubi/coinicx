"use client";

import React from "react";
import { useMediaQuery } from "usehooks-ts";

import SpotChart from "./Chart";
import OrderBook from "./OrderBook";
import OrderForm from "./OrderForm";
import TickerOverview from "./TickerOverview";

const Trade = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="bg-trade-dark w-full flex gap-1 p-1 flex-wrap md:flex-nowrap">
      <div className="w-full space-y-1">
        <TickerOverview />

        <div className="flex gap-1 md:flex-wrap-reverse xl:flex-nowrap">
          {!isMobile && <OrderBook />}
          <SpotChart />
        </div>
      </div>
      <OrderForm />
    </div>
  );
};

export default Trade;
