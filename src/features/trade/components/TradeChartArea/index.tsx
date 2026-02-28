"use client";

import { Activity, useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";

import { ChartAreaTabValue } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";

import AssetInfo from "./AssetInfo";

const ChartArea = dynamic(() => import("./Chart"), { ssr: false });

const OrderBook = dynamic(() => import("../OrderBook"), { ssr: false });

const ChartHeader = dynamic(() => import("./Header/ChartHeader"), {
  ssr: false,
});

type State = {
  currentTab: ChartAreaTabValue;
  fullscreen: boolean;
};

const TradeChartArea = () => {
  const isMobile = useIsMobile();

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
    <div
      ref={wrapperRef}
      className="group/chart w-full bg-primary-dark md:rounded-md"
    >
      <ChartHeader
        currentTab={state.currentTab}
        fullscreen={state.fullscreen}
        onTabChange={(currentTab) => dispatch({ currentTab })}
        onFullScreen={handleFullscreen}
      />

      <div role="tabpanel" className="w-full">
        <Activity mode={state.currentTab === "chart" ? "visible" : "hidden"}>
          <ChartArea />
        </Activity>
      </div>

      <div role="tabpanel" className="w-full">
        <Activity
          mode={state.currentTab === "orderbook" ? "visible" : "hidden"}
        >
          <OrderBook />
        </Activity>
      </div>

      <div role="tabpanel" className="w-full">
        <Activity mode={state.currentTab === "info" ? "visible" : "hidden"}>
          <AssetInfo />
        </Activity>
      </div>
    </div>
  );
};

export default TradeChartArea;
