"use client";

import { Activity, useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";

import { ChartAreaTabValue } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useChartSettingsStore,
  useShallowChartSettingsStore,
} from "@/store/trade/chart-settings";
import { cn } from "@/utils/cn";

const OrderBook = dynamic(() => import("../OrderBook"), { ssr: false });
const ChartCategories = dynamic(() => import("./Header/ChartCategories"), {
  ssr: false,
});
const ChartHeader = dynamic(() => import("./Header/ChartHeader"), {
  ssr: false,
});
const KlineChart = dynamic(() => import("./Chart/Kline/KlineChart"), {
  ssr: false,
});
const DepthChart = dynamic(() => import("./Chart/Depth"), { ssr: false });

type State = {
  currentTab: ChartAreaTabValue;
  fullscreen: boolean;
};

const TradeChartArea = () => {
  const isMobile = useIsMobile();

  const chartType = useShallowChartSettingsStore((s) => s.chartType);

  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    {
      currentTab: "chart",
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
          value={chartType}
          onValueChange={(chartType) =>
            useChartSettingsStore.getState().setSettings({ chartType })
          }
        />
        <div
          id="chartArea"
          className={cn("w-full h-dvh", {
            "lg:w-[calc(100vw-300px)] xl:w-[calc(100vw-650px)] h-125":
              !state.fullscreen,
          })}
        >
          <Activity mode={chartType === "standard" ? "visible" : "hidden"}>
            <KlineChart />
          </Activity>

          <Activity mode={chartType === "depth" ? "visible" : "hidden"}>
            <DepthChart />
          </Activity>
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
        className={cn(
          "w-full lg:w-[calc(100vw-300px)] xl:w-[calc(100vw-650px)] h-125 flex justify-center items-center",
          {
            hidden: state.currentTab !== "info",
          },
        )}
      >
        <p>Coming Soon</p>
      </div>
    </div>
  );
};

export default TradeChartArea;
