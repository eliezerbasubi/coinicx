import React from "react";
import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";
import TokenImage from "@/components/common/TokenImage";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import {
  formatDateFromPeriod,
  parseExpiry,
} from "@/features/predict/lib/utils/parseMetadata";

import LiveMarketDetails from "./LiveMarketDetails";
import { MarketEventStats } from "./MarketEventStats";

const MarketEventHeader = () => {
  const marketEventMeta = useMarketEventContext(
    (state) => state.marketEventMeta,
  );

  return (
    <div className="w-full sticky top-16 z-10 bg-primary-dark py-4">
      <div className="flex items-center gap-2 mb-4">
        <Link prefetch href={ROUTES.predict.index}>
          <p className="text-xs font-medium text-neutral-gray-400 hover:text-white transition-colors">
            Markets
          </p>
        </Link>
        <p className="text-xs font-medium text-neutral-gray-400">/</p>
        <p className="text-xs font-medium text-neutral-gray-400">
          {marketEventMeta.title}
        </p>
      </div>
      <div className="w-full flex items-center gap-4">
        {marketEventMeta.recurringPayload?.underlying && (
          <TokenImage
            name={marketEventMeta.recurringPayload?.underlying}
            instrumentType="spot"
            className="size-16 rounded-lg"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-1 text-neutral-gray-400 mb-1">
            {marketEventMeta.categories.map((category, index) => (
              <React.Fragment key={category}>
                <p className="text-xs font-medium capitalize">{category}</p>
                {index < marketEventMeta.categories.length - 1 && (
                  <span className="text-xs font-medium">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <h1 className="flex-1 text-xl font-semibold line-clamp-2">
            {marketEventMeta.title}
          </h1>

          <div className="flex items-center gap-1 mt-1 divide-x divide-neutral-gray-200">
            <MarketEventStats variant="compact" showOnEmpty={false} />
            {marketEventMeta.recurringPayload?.expiry && (
              <p className="text-xs font-medium text-neutral-gray-400 pl-1">
                <span>
                  {formatExpiryDate(marketEventMeta.recurringPayload.expiry)}
                </span>
                <span>-</span>
                <span>
                  {formatDateFromPeriod(
                    marketEventMeta.recurringPayload.period,
                    marketEventMeta.recurringPayload.expiry,
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    },
                  )}{" "}
                  UTC
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <LiveMarketDetails />
    </div>
  );
};

const formatExpiryDate = (expiry: string) => {
  const date = parseExpiry(expiry);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    hour12: true,
  };

  const parts = new Intl.DateTimeFormat("en-US", formatOptions)
    .formatToParts(date)
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("");

  return parts.trimEnd();
};

export default MarketEventHeader;
