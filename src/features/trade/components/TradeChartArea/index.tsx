"use client";

import { Activity, useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Minimize2 } from "lucide-react";

import { ChartAreaTabValue } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/cn";

import AssetInfo from "./AssetInfo";

const ChartArea = dynamic(() => import("./Chart"), { ssr: false });

const OrderBook = dynamic(() => import("../OrderBook"), { ssr: false });

const TABS: Array<{
  label: string;
  value: ChartAreaTabValue;
  mobileOnly?: boolean;
}> = [
  { label: "Chart", value: "chart" },
  { label: "Order Book", value: "orderbook", mobileOnly: true },
  { label: "Info", value: "info" },
];

type State = {
  currentTab: ChartAreaTabValue;
  fullscreen: boolean;
};

type Props = {
  className?: string;
};

const TradeChartArea = ({ className }: Props) => {
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
      className={cn(
        "group/chart w-full bg-primary-dark md:rounded-md",
        className,
      )}
    >
      <Tabs
        value={state.currentTab}
        onValueChange={(value) =>
          dispatch({ currentTab: value as ChartAreaTabValue })
        }
        className="h-full gap-0"
      >
        <TabsList
          variant="line"
          className="w-full px-4 shrink-0 gap-x-4 justify-start"
        >
          {TABS.map((tab) => {
            if (!isMobile && tab.mobileOnly) return null;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit flex-0 text-sm font-medium"
              >
                {tab.label}
              </TabsTrigger>
            );
          })}
          <Visibility visible={!isMobile}>
            <div className="flex-1 flex justify-end">
              <button
                className="text-neutral-gray-400 hover:text-gray-300 [&>svg]:size-4"
                onClick={handleFullscreen}
              >
                {state.fullscreen ? <Minimize2 /> : <Maximize2 />}
              </button>
            </div>
          </Visibility>
        </TabsList>

        {/* We use activity to avoid unmounting the entire chart tree */}
        <div role="tabpanel" className="w-full">
          <Activity mode={state.currentTab === "chart" ? "visible" : "hidden"}>
            <ChartArea />
          </Activity>
        </div>

        <div role="tabpanel" className="w-full">
          <Activity
            mode={state.currentTab === "orderbook" ? "visible" : "hidden"}
          >
            <OrderBook orientation="horizontal" />
          </Activity>
        </div>

        <div role="tabpanel" className="w-full">
          <Activity mode={state.currentTab === "info" ? "visible" : "hidden"}>
            <AssetInfo />
          </Activity>
        </div>
      </Tabs>
    </div>
  );
};

export default TradeChartArea;
