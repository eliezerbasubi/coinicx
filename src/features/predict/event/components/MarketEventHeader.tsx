import React from "react";
import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";
import {
  formatDateFromPeriod,
  parseExpiry,
} from "@/features/predict/utils/parseMetadata";

import LiveMarketDetails from "./LiveMarketDetails";

const MarketEventHeader = () => {
  const marketEvent = useMarketEventContext((state) => state.marketEvent);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Link href={ROUTES.predict.index}>
          <p className="text-xs font-medium text-neutral-gray-400 hover:text-white transition-colors">
            Markets
          </p>
        </Link>
        <p className="text-xs font-medium text-neutral-gray-400">/</p>
        <p className="text-xs font-medium text-neutral-gray-400">
          {marketEvent.title}
        </p>
      </div>
      <div className="w-full flex items-center gap-4">
        <Visibility visible={!!marketEvent.underlying}>
          <TokenImage
            name={marketEvent.underlying}
            instrumentType="spot"
            className="size-16 rounded-lg"
          />
        </Visibility>

        <div className="flex-1">
          <div className="flex items-center gap-1 text-neutral-gray-400 mb-1">
            {marketEvent.categories.map((category, index) => (
              <React.Fragment key={category}>
                <p className="text-xs font-medium capitalize">{category}</p>
                {index < marketEvent.categories.length - 1 && (
                  <span className="text-xs font-medium">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <h1 className="flex-1 text-xl font-semibold line-clamp-2">
            {marketEvent.title}
          </h1>

          <div className="flex items-center gap-1 mt-1 divide-x divide-neutral-gray-200">
            <Visibility visible={!!marketEvent.volume}>
              <p className="text-xs font-medium text-neutral-gray-400 pr-2">
                <span>
                  {formatNumber(marketEvent.volume, {
                    style: "currency",
                    notation: "compact",
                  })}
                </span>
                <span className="ml-1">Vol</span>
              </p>
            </Visibility>
            <Visibility visible={!!marketEvent.openInterest}>
              <p className="text-xs font-medium text-neutral-gray-400 pr-2">
                <span>
                  {formatNumber(marketEvent.openInterest, {
                    style: "currency",
                    notation: "compact",
                  })}
                </span>
                <span className="ml-1">OI</span>
              </p>
            </Visibility>
            {marketEvent.expiry && (
              <p className="text-xs font-medium text-neutral-gray-400 pl-1">
                <span>{formatExpiryDate(marketEvent.expiry)}</span>
                <span>-</span>
                <span>
                  {formatDateFromPeriod(
                    marketEvent.period,
                    marketEvent.expiry,
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
