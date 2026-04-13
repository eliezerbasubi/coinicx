import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";

import MarketEventsListing from "./components/MarketEventsListing";

const PredictionMarkets = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      <div className="w-full flex items-center gap-4 px-4 md:px-6 xl:px-0 mb-2">
        <Link prefetch href={ROUTES.root} className="block md:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base md:text-2xl font-semibold md:font-extrabold text-white text-center md:text-left flex-1">
            Predictions
          </h1>
          <h2 className="text-sm md:text-base text-neutral-gray-400 text-center md:text-left mt-1 hidden lg:block">
            Trade on the world's most exciting events
          </h2>
        </div>
      </div>

      <MarketEventsListing />
    </div>
  );
};

export default PredictionMarkets;
