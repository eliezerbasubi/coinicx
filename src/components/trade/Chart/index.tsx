"use client";

import React, { useReducer } from "react";

import { ChartInterval, ChartType } from "@/types/trade";
import { cn } from "@/utils/cn";

import { CHART_TIME_INTERVALS } from "../constants";
import ChartCategories from "./Header/ChartCategories";
import ChartHeader from "./Header/ChartHeader";
import KlineChart from "./Kline/KlineChart";

type State = {
  chartType: ChartType;
  interval: ChartInterval;
};

const SpotChart = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { chartType: "standard", interval: CHART_TIME_INTERVALS[0] },
  );

  return (
    <div className="w-full bg-primary-dark rounded-md">
      <ChartHeader />

      <ChartCategories
        interval={state.interval}
        value={state.chartType}
        onValueChange={(chartType) => dispatch({ chartType })}
        onIntervalChange={(interval) => dispatch({ interval })}
      />

      <div id="chartArea" className="w-full h-[442px]">
        <div
          className={cn("w-full h-full", {
            hidden: state.chartType !== "standard",
          })}
        >
          <KlineChart interval={state.interval} />
        </div>
      </div>
    </div>
  );
};

export default SpotChart;
