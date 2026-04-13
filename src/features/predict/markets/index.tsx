"use client";

import MarketEventsListing from "./components/MarketEventsListing";

const PredictionMarkets = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 md:px-6 xl:px-0">
      <h1 className="text-xl md:text-2xl font-bold text-white">
        Prediction Markets
      </h1>

      <MarketEventsListing />
    </div>
  );
};

export default PredictionMarkets;
