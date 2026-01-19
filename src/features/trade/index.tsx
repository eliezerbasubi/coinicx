"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";

import SpotChart from "./components/Chart";
import TickerOverview from "./components/TickerOverview";
import TradeUserInfo from "./components/UserInfo";

const OrderBook = dynamic(() => import("./components/OrderBook"), {
  ssr: false,
  loading: () => (
    <div className="w-full lg:w-[calc(100vw-300px)] xl:w-[calc(100vw-650px)] h-125 flex flex-col md:max-w-full xl:max-w-80 bg-primary-dark rounded-md" />
  ),
});
const OrderForm = dynamic(() => import("./components/OrderForm/OrderForm"), {
  ssr: false,
  loading: () => (
    <div className="w-full lg:w-[calc(100vw-300px)] xl:w-[calc(100vw-650px)] h-145.5 md:max-w-80 bg-primary-dark md:rounded-md pb-12 md:pb-0" />
  ),
});
const OrderFormMobile = dynamic(
  () => import("./components/OrderForm/OrderFormMobile"),
  {
    ssr: false,
  },
);

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
