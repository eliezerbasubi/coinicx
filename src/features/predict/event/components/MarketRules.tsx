import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

const MarketRules = () => {
  const description = useMarketEventContext(
    (s) => s.marketEventMeta.description,
  );

  return (
    <div className="w-full space-y-2 mt-4">
      <h2 className="text-base font-semibold">Market Rules</h2>
      <p className="text-sm">{description}</p>
    </div>
  );
};

export default MarketRules;
