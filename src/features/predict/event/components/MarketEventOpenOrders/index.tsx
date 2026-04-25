import { cn } from "@/lib/utils/cn";
import { useActiveOutcomeMeta } from "@/features/predict/lib/store/market-event/hooks";
import { useShallowUserPredictionStore } from "@/features/predict/lib/store/user-prediction";

import MarketEventOpenOrdersTable from "./MarketEventOpenOrdersTable";

type Props = {
  className?: string;
};

const MarketEventOpenOrders = ({ className }: Props) => {
  const { marketEventMeta } = useActiveOutcomeMeta();

  const hasOrders = useShallowUserPredictionStore(
    (s) => !!s.openOrders.get(marketEventMeta.outcome)?.length,
  );

  if (!hasOrders) return null;

  return (
    <div
      className={cn(
        "w-full lg:bg-neutral-gray-600 rounded-lg border lg:border-0 border-neutral-gray-200",
        className,
      )}
    >
      <h3 className="text-base text-white font-semibold p-4">Open Orders</h3>
      <MarketEventOpenOrdersTable outcomeMeta={marketEventMeta} />
    </div>
  );
};

export default MarketEventOpenOrders;
