"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";

import SpotChart from "./Chart";
import TickerOverview from "./TickerOverview";
import TradeUserInfo from "./UserInfo";

const OrderBook = dynamic(() => import("./OrderBook"));
const OrderForm = dynamic(() => import("./OrderForm/OrderForm"));
const OrderFormMobile = dynamic(() => import("./OrderForm/OrderFormMobile"), {
  ssr: false,
});

const Trade = () => {
  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  return (
    <div className="w-full">
      <div className="bg-trade-dark w-full flex gap-1 py-0.5 md:p-1 flex-wrap md:flex-nowrap">
        <div className="w-full space-y-1">
          <TickerOverview />

          <div className="flex gap-1 md:flex-wrap-reverse xl:flex-nowrap">
            {!isMobile && <OrderBook />}
            <SpotChart />
          </div>
        </div>
        {isMobile ? <OrderFormMobile /> : <OrderForm />}
      </div>
      <TradeUserInfo />
    </div>
  );
};

export default Trade;
