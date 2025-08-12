"use client";

import React, { useReducer, useRef } from "react";

import { ChartInterval, ChartType } from "@/types/trade";
import { cn } from "@/utils/cn";

import { CHART_TIME_INTERVALS } from "../constants";
import ChartCategories from "./Header/ChartCategories";
import ChartHeader from "./Header/ChartHeader";
import KlineChart from "./Kline/KlineChart";

type State = {
  chartType: ChartType;
  interval: ChartInterval;
  currentTab: number;
  fullscreen: boolean;
};

const SpotChart = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      chartType: "standard",
      interval: CHART_TIME_INTERVALS[0],
      currentTab: 0,
      fullscreen: false,
    },
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = async () => {
    if (!state.fullscreen) {
      await wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

    dispatch({ fullscreen: !state.fullscreen });
  };

  return (
    <div ref={wrapperRef} className="w-full bg-primary-dark rounded-md">
      <ChartHeader
        currentTab={state.currentTab}
        fullscreen={state.fullscreen}
        onTabChange={(currentTab) => dispatch({ currentTab })}
        onFullScreen={handleFullscreen}
      />

      <ChartCategories
        interval={state.interval}
        value={state.chartType}
        onValueChange={(chartType) => dispatch({ chartType })}
        onIntervalChange={(interval) => dispatch({ interval })}
      />

      <div
        id="chartArea"
        className={cn("w-full h-[480px]", { "h-full": state.fullscreen })}
      >
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
