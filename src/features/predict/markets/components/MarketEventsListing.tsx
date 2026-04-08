import React from "react";

import { useMarketEvents } from "../../hooks/useMarketEvents";
import MarketEventCard from "./MarketEventCard";

const MarketEventsListing = () => {
  const { marketEvents, isLoading, error } = useMarketEvents();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-3 py-4">
      {marketEvents.map((event) => (
        <MarketEventCard key={event.coin} data={event} />
      ))}
    </div>
  );
};

export default MarketEventsListing;
