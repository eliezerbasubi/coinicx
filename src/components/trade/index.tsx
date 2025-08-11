import React from "react";

import SpotChart from "./Chart";
import OrderBook from "./OrderBook";
import OrderForm from "./OrderForm";
import TickerOverview from "./TickerOverview";

const SpotTrade = () => {
  return (
    <div className="bg-trade-dark w-full flex gap-1 p-1">
      <div className="w-full space-y-1">
        <TickerOverview />

        <div className="flex gap-1">
          <OrderBook />
          <SpotChart />
        </div>
      </div>
      <OrderForm />
    </div>
  );
};

export default SpotTrade;
