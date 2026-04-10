"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PREDICTION_CATEGORIES } from "../lib/constants/categories";
import MarketEventsListing from "./components/MarketEventsListing";

const PredictionMarkets = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 md:px-0">
      <h1 className="text-2xl font-bold text-white">Prediction Markets</h1>

      <Tabs defaultValue="all">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="all" className="flex-0">
            All
          </TabsTrigger>
          {Object.keys(PREDICTION_CATEGORIES).map((category) => {
            if (category === "other") return null;

            return (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-0 capitalize"
              >
                {category}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <MarketEventsListing />
    </div>
  );
};

export default PredictionMarkets;
