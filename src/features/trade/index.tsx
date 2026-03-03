"use client";

import dynamic from "next/dynamic";

import { useIsMobile } from "@/hooks/useIsMobile";

import TickerOverview from "./components/TickerOverview";
import TradeChartArea from "./components/TradeChartArea";
import TradeUserInfo from "./components/TradeUserInfo";
import UserAccountInfo from "./components/UserAccountInfo";

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
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      <div className="bg-trade-dark w-full flex gap-1 py-0.5 md:p-1 flex-wrap md:flex-nowrap">
        <div className="w-full space-y-1">
          <TickerOverview />

          <div className="flex gap-1 md:flex-wrap-reverse xl:flex-nowrap">
            {!isMobile && <OrderBook />}
            <TradeChartArea />
          </div>
        </div>
        {isMobile ? <OrderFormMobile /> : <OrderForm />}
      </div>
      <div className="w-full bg-trade-dark flex gap-1 py-0.5 md:px-1 md:pb-2 flex-wrap md:flex-nowrap">
        <TradeUserInfo />
        <UserAccountInfo />
      </div>
    </div>
  );
};

export default Trade;
