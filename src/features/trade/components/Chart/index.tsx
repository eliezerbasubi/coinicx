"use client";

import React, { useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";

import { ChartAreaTabValue, ChartType } from "@/types/trade";
import Visibility from "@/components/common/Visibility";
import { cn } from "@/utils/cn";

const OrderBook = dynamic(() => import("../OrderBook"), { ssr: false });
const ChartCategories = dynamic(() => import("./Header/ChartCategories"), {
  ssr: false,
});
const ChartHeader = dynamic(() => import("./Header/ChartHeader"), {
  ssr: false,
});
const KlineChart = dynamic(() => import("./Kline/KlineChart"), { ssr: false });

type State = {
  chartType: ChartType;
  currentTab: ChartAreaTabValue;
  fullscreen: boolean;
};

const SpotChart = () => {
  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      chartType: "standard",
      currentTab: "chart",
      fullscreen: false,
    },
  );

  // Keeps track of loaded components to render tab content only once and hide it when switching to other tabs
  const loadedChartTabs = useRef<Array<ChartType>>(["standard"]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = async () => {
    if (!state.fullscreen) {
      await wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

    dispatch({ fullscreen: !state.fullscreen });
  };

  // Set current tab to chart if user was visiting orderbook tab and moves to tablet viewport
  useEffect(() => {
    if (!isMobile && state.currentTab === "orderbook") {
      dispatch({ currentTab: "chart" });
    }
  }, [isMobile, state.currentTab]);

  return (
    <div ref={wrapperRef} className="w-full bg-primary-dark md:rounded-md">
      <ChartHeader
        currentTab={state.currentTab}
        fullscreen={state.fullscreen}
        onTabChange={(currentTab) => dispatch({ currentTab })}
        onFullScreen={handleFullscreen}
      />

      <div
        role="tabpanel"
        className={cn("w-full", {
          hidden: state.currentTab !== "chart",
        })}
      >
        <ChartCategories
          value={state.chartType}
          onValueChange={(chartType) => {
            if (!loadedChartTabs.current.includes(chartType)) {
              loadedChartTabs.current.push(chartType);
            }
            dispatch({ chartType });
          }}
        />
        <div
          id="chartArea"
          className={cn(
            "w-full lg:w-[calc(100vw-300px)] xl:w-[calc(100vw-650px)] h-125",
            {
              "h-dvh": state.fullscreen,
            },
          )}
        >
          <Visibility visible={loadedChartTabs.current.includes("standard")}>
            <div
              className={cn("w-full h-full", {
                hidden: state.chartType !== "standard",
              })}
            >
              <KlineChart />
            </div>
          </Visibility>
        </div>
      </div>

      <div
        role="tabpanel"
        className={cn("w-full", { hidden: state.currentTab !== "orderbook" })}
      >
        {state.currentTab === "orderbook" && <OrderBook />}
      </div>

      <div
        role="tabpanel"
        className={cn("w-full flex justify-center items-center", {
          hidden: state.currentTab !== "info",
        })}
      >
        <p>Coming Soon</p>
      </div>
      <div
        role="tabpanel"
        className={cn("w-full flex justify-center items-center", {
          hidden: state.currentTab !== "tradingAnalysis",
        })}
      >
        <p>Coming Soon</p>
      </div>
      <div
        role="tabpanel"
        className={cn("w-full flex justify-center items-center", {
          hidden: state.currentTab !== "tradingData",
        })}
      >
        <p>Coming Soon</p>
      </div>
    </div>
  );
};

export default SpotChart;
