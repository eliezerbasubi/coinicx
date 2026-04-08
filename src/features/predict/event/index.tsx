"use client";

import CategoricalOutcomes from "./components/CategoricalOutcomes";
import MarketEventHeader from "./components/MarketEventHeader";
import MarketRules from "./components/MarketRules";
import TradingForm from "./components/TradingForm";

const MarketEvent = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 md:px-0 flex gap-8">
      {/* Main Content */}
      <main className="w-full">
        <MarketEventHeader />

        {/* Chart will go here */}
        <div className="w-full flex items-center gap-2 min-h-60 bg-neutral-gray-600 rounded-lg mt-4"></div>

        {/* Categorical outcomes */}
        <CategoricalOutcomes />

        {/* Market Rules */}
        <MarketRules />
      </main>

      <aside className="w-full max-w-80 mt-4">
        <TradingForm className="bg-neutral-gray-600 rounded-lg pb-4" />
      </aside>
    </div>
  );
};

export default MarketEvent;
