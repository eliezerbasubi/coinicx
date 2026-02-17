import React from "react";

import { useInstrumentStore } from "@/store/trade/instrument";

import TradingViewWidget from "./TradingViewWidget";

const TradingViewChart = () => {
  const coin = useInstrumentStore((s) => s.assetMeta?.coin);

  const ticker = coin ? `${coin}USD` : "BTCUSD";
  const symbol = `HYPERLIQUID:${ticker}`;

  return (
    <div id="tradingview-chart" className="size-full">
      <TradingViewWidget
        autosize
        container_id="tradingview-chart"
        symbol={symbol}
      />
    </div>
  );
};

export default TradingViewChart;
