import { Skeleton } from "@/components/ui/skeleton";

const MarketEventListingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-3 py-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-40 bg-neutral-gray-600" />
      ))}
    </div>
  );
};

export default MarketEventListingSkeleton;
