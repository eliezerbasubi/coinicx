"use client";

import CategoricalOutcomes from "./components/CategoricalOutcomes";
import MarketEventChart from "./components/MarketEventChart";
import MarketEventHeader from "./components/MarketEventHeader";
import MarketRules from "./components/MarketRules";
import OrderbookAccordion from "./components/OrderbookAccordion";
import TradingForm from "./components/TradingForm";

const MarketEvent = () => {
  return (
    <div className="size-full max-w-7xl mx-auto px-4 md:px-0 flex gap-8">
      {/* Main Content */}
      <main className="size-full">
        <MarketEventHeader />

        <MarketEventChart />

        {/* Categorical outcomes */}
        <CategoricalOutcomes />

        {/* Orderbook */}
        <OrderbookAccordion />

        {/* Market Rules */}
        <MarketRules />
      </main>

      <aside className="w-full max-w-80">
        <div className="sticky top-40">
          <TradingForm className="bg-neutral-gray-600 rounded-lg pb-4" />
        </div>
      </aside>
    </div>
  );
};

export default MarketEvent;
