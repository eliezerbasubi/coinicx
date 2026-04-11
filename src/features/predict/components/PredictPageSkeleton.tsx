import { Skeleton } from "@/components/ui/skeleton";

import MarketEventListingSkeleton from "./MarketEventListingSkeleton";

const PredictPageSkeleton = () => {
  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="w-full max-w-7xl mx-auto py-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold text-white">Prediction Markets</h1>

        <div className="w-full h-11 mt-4">
          <Skeleton className="w-full h-full bg-neutral-gray-600" />
        </div>

        <MarketEventListingSkeleton />
      </div>
    </div>
  );
};

export default PredictPageSkeleton;
