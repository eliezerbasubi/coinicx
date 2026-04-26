"use client";

import dynamic from "next/dynamic";

import { useIsLaptop } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";

import TradingWidget from "../components/TradingWidget";
import { useMarketEventContext } from "../lib/store/market-event/hooks";
import BottomNavActions from "./components/BottomNavActions";
import CategoricalOutcomes from "./components/CategoricalOutcomes";
import MarketEventBreadcrumbs from "./components/MarketEventBreadcrumbs";
import MarketEventChart from "./components/MarketEventChart";
import MarketEventHeader from "./components/MarketEventHeader";
import MarketEventOpenOrders from "./components/MarketEventOpenOrders";
import MarketEventPositions from "./components/MarketEventPositions";
import MarketRules from "./components/MarketRules";
import OrderbookAccordion from "./components/OrderbookAccordion";

const TradingWidgetDrawer = dynamic(
  () =>
    import("../components/TradingWidgetDrawer").then(
      (m) => m.TradingWidgetDrawer,
    ),
  { ssr: false },
);

const MarketEvent = () => {
  const isLaptop = useIsLaptop({ initializeWithValue: false });
  const marketEventType = useMarketEventContext((s) => s.marketEventMeta.type);

  return (
    <div className="size-full max-w-7xl mx-auto px-4 md:px-6 xl:px-0 flex gap-4 xl:gap-8 pb-12 lg:pb-0">
      {/* Main Content */}
      <main className="size-full">
        <div className="w-full sticky md:top-16 z-10 bg-primary-dark py-4">
          <MarketEventBreadcrumbs />
          <MarketEventHeader />
        </div>

        <MarketEventChart />

        {/* Categorical outcomes */}
        <CategoricalOutcomes />

        {/* Orderbook */}
        <Visibility visible={marketEventType !== "categorical"}>
          <MarketEventPositions className="mt-4" />
          <MarketEventOpenOrders className="mt-4" />
          <OrderbookAccordion />
        </Visibility>

        {/* Market Rules */}
        <MarketRules />
      </main>

      <aside className="w-full max-w-80 shrink-0 hidden lg:block">
        <div className="sticky top-40">
          <TradingWidget
            className="bg-neutral-gray-600 rounded-lg pb-4"
            showEventTitle={marketEventType === "categorical"}
          />
        </div>
      </aside>

      <Visibility visible={!isLaptop && marketEventType !== "categorical"}>
        <BottomNavActions />
      </Visibility>

      <Visibility visible={!isLaptop}>
        <TradingWidgetDrawer />
      </Visibility>
    </div>
  );
};

export default MarketEvent;
