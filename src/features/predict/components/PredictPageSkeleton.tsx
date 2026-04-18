import { Skeleton } from "@/components/ui/skeleton";

import MarketEventListingSkeleton from "./MarketEventListingSkeleton";

const PredictPageSkeleton = () => {
  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="w-full max-w-7xl mx-auto py-4 px-4 md:px-6 xl:px-0 mb-2">
        <div className="flex-1">
          <h1 className="text-base md:text-2xl font-semibold md:font-extrabold text-white text-center md:text-left flex-1">
            Predictions
          </h1>
          <h2 className="text-sm md:text-base text-neutral-gray-400 text-center md:text-left mt-1 hidden md:block">
            Trade on the world's most exciting events
          </h2>
        </div>

        <div className="w-full h-11 mt-4">
          <Skeleton className="w-full h-full bg-neutral-gray-600" />
        </div>

        <MarketEventListingSkeleton />
      </div>
    </div>
  );
};

export default PredictPageSkeleton;
