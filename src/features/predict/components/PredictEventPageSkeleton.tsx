import { Skeleton } from "@/components/ui/skeleton";

const PredictEventPageSkeleton = () => {
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <div className="size-full max-w-7xl mx-auto px-4 md:px-6 xl:px-0 flex gap-4 xl:gap-8">
        <div className="flex-1 space-y-2 mt-4">
          {/* Breadcrumbs */}
          <Skeleton className="w-3/4 bg-neutral-gray-600" />

          {/* Header */}
          <div className="flex items-center gap-2">
            <Skeleton className="size-16 rounded-lg bg-neutral-gray-600" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 bg-neutral-gray-600" />
              <Skeleton className="w-full bg-neutral-gray-600" />
            </div>
          </div>

          {/* Chart */}
          <Skeleton className="w-full min-h-80 bg-neutral-gray-600" />

          {/* Market Rules */}
          <Skeleton className="w-full min-h-40 bg-neutral-gray-600" />
        </div>

        <div className="w-80 shrink-0">
          {/* Trading Form */}
          <Skeleton className="w-full min-h-96 bg-neutral-gray-600 sticky top-40" />
        </div>
      </div>
    </div>
  );
};

export default PredictEventPageSkeleton;
