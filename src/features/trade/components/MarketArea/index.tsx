"use client";

import { Activity, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Minimize2 } from "lucide-react";

import { MarketAreaTabValue } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/store/trade/user-preferences";
import { cn } from "@/utils/cn";

const AssetInfo = dynamic(() => import("../AsssetInfo"), { ssr: false });
const ChartArea = dynamic(() => import("../ChartArea"), { ssr: false });
const OrderBook = dynamic(() => import("../OrderBook"), { ssr: false });

const TABS = [
  { label: "Chart", value: "chart" },
  { label: "Order Book", value: "orderbook" },
  { label: "Info", value: "info" },
] as const;

type Props = {
  className?: string;
  excludeTabs?: MarketAreaTabValue[];
};

const MarketArea = ({ className, excludeTabs }: Props) => {
  const isMobile = useIsMobile();

  const marketActiveTab = useShallowPreferencesStore((s) => s.marketActiveTab);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Set default value if the excluded tabs include the current tab
  useEffect(() => {
    if (excludeTabs && excludeTabs.includes(marketActiveTab)) {
      usePreferencesStore
        .getState()
        .dispatch({ marketActiveTab: TABS[0].value });
    }
  }, [marketActiveTab, excludeTabs]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "group/market w-full bg-primary-dark md:rounded-md",
        className,
      )}
    >
      <Tabs
        value={marketActiveTab}
        onValueChange={(value) =>
          usePreferencesStore
            .getState()
            .dispatch({ marketActiveTab: value as MarketAreaTabValue })
        }
        className="h-full gap-0"
      >
        <TabsList
          variant="line"
          className="w-full px-4 shrink-0 gap-x-2 md:gap-x-4 justify-start"
        >
          {TABS.map((tab) => {
            if (excludeTabs && excludeTabs.includes(tab.value)) return null;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit flex-0 text-xs md:text-sm font-medium"
              >
                {tab.label}
              </TabsTrigger>
            );
          })}
          <Visibility visible={!isMobile}>
            <div className="flex-1 flex justify-end">
              <button
                className="text-neutral-gray-400 hover:text-gray-300 size-4 [&>svg]:size-4 overflow-hidden"
                onClick={handleFullscreen}
              >
                <Minimize2 className="hidden group-fullscreen/market:block" />
                <Maximize2 className="block group-fullscreen/market:hidden" />
              </button>
            </div>
          </Visibility>
        </TabsList>

        {/* We use activity to avoid unmounting the entire chart tree */}
        <div role="tabpanel" className="w-full">
          <Activity mode={marketActiveTab === "chart" ? "visible" : "hidden"}>
            <ChartArea />
          </Activity>
        </div>

        <div role="tabpanel" className="w-full">
          <Activity
            mode={marketActiveTab === "orderbook" ? "visible" : "hidden"}
          >
            <OrderBook orientation="horizontal" orderbookVisibleRows={18} />
          </Activity>
        </div>

        <div role="tabpanel" className="w-full">
          <Activity mode={marketActiveTab === "info" ? "visible" : "hidden"}>
            <AssetInfo />
          </Activity>
        </div>
      </Tabs>
    </div>
  );
};

export default MarketArea;
