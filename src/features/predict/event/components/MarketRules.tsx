import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";
import { parseRecurringMetadata } from "@/features/predict/utils/parseMetadata";

const MarketRules = () => {
  const marketEvent = useMarketEventContext((state) => state.marketEvent);

  const metadata = parseRecurringMetadata(
    marketEvent.description,
    marketEvent.resolution,
  );

  return (
    <div className="w-full space-y-2 mt-4">
      <h2 className="text-base font-semibold">Market Rules</h2>
      <p className="text-sm">{metadata?.description}</p>
    </div>
  );
};

export default MarketRules;
