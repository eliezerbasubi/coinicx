import { cn } from "@/lib/utils/cn";
import { useActiveOutcomeMeta } from "@/features/predict/lib/store/market-event/hooks";
import { useShallowUserPredictionStore } from "@/features/predict/lib/store/user-prediction";

import MarketEventPositionsTable from "./MarketEventPositionsTable";

type Props = {
  className?: string;
};

const MarketEventPositions = ({ className }: Props) => {
  const { marketEventMeta } = useActiveOutcomeMeta();

  const hasPositions = useShallowUserPredictionStore(
    (s) => !!s.predictionBalances.get(marketEventMeta.outcome)?.length,
  );

  if (!hasPositions) return null;

  return (
    <div
      className={cn(
        "w-full lg:bg-neutral-gray-600 rounded-lg border lg:border-0 border-neutral-gray-200",
        className,
      )}
    >
      <h3 className="text-base text-white font-semibold p-4">Positions</h3>
      <MarketEventPositionsTable outcomeMeta={marketEventMeta} />
    </div>
  );
};

export default MarketEventPositions;
