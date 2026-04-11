import MarketEventListingSkeleton from "@/features/predict/components/MarketEventListingSkeleton";
import PredictError from "@/features/predict/components/PredictError";
import { useMarketEvents } from "@/features/predict/hooks/useMarketEvents";

import MarketEventCard from "./MarketEventCard";

const MarketEventsListing = () => {
  const { marketEvents, error, isLoading } = useMarketEvents();

  if (isLoading) {
    return <MarketEventListingSkeleton />;
  }

  if (error) {
    return (
      <PredictError
        title="Something went wrong"
        description="We're having trouble loading market events. Please try again later."
      />
    );
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
