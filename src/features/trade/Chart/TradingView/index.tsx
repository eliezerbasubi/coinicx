import React from "react";

import TradingViewWidget from "./TradingViewWidget";

const TradingViewChart = () => {
  return (
    <div id="tradingview-chart" className="size-full">
      <TradingViewWidget autosize container_id="tradingview-chart" />
    </div>
  );
};

export default TradingViewChart;
