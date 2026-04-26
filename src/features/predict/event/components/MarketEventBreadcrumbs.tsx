import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

const MarketEventBreadcrumbs = () => {
  const title = useMarketEventContext((state) => state.marketEventMeta.title);

  return (
    <div className="flex items-center gap-2 mb-4">
      <Link
        prefetch
        href={ROUTES.predict.index}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="size-5 block md:hidden" />
        <p className="text-xs font-medium text-white md:text-neutral-gray-400 hover:text-white transition-colors">
          Markets
        </p>
      </Link>
      <p className="text-xs font-medium text-neutral-gray-400 hidden md:block">
        /
      </p>
      <p className="text-xs font-medium text-neutral-gray-400 hidden md:block">
        {title}
      </p>
    </div>
  );
};

export default MarketEventBreadcrumbs;
