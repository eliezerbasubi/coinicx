import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ChevronRight } from "lucide-react";

import { useInstrumentStore } from "@/lib/store/trade/instrument";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { useSpotMetas } from "@/features/predict/hooks/useSpotMetas";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";
import {
  parseExpiry,
  parseRecurringDescription,
} from "@/features/predict/utils/parseMetadata";
import { formatPriceToDecimal, getPriceDecimals } from "@/features/trade/utils";

const LiveMarketDetails = () => {
  const marketEvent = useMarketEventContext((state) => state.marketEvent);

  const recurringPayload = parseRecurringDescription(marketEvent.description);

  const spotAssetCtxs = useInstrumentStore((s) => s.spotAssetCtxs);
  const spotMetas = useSpotMetas();

  const activeAsset = useMemo(() => {
    if (!recurringPayload || !spotMetas) return null;

    const universeIndex = spotMetas.tokenNamesToUniverseIndex
      ?.get(recurringPayload.underlying)
      ?.get("USDC"); // USDH and USDC are both stablecoins, so we use USDC as the quote asset

    if (!universeIndex) return null;

    const universe = spotMetas.spotMeta.universe[universeIndex];

    if (!universe) return null;

    const baseTokenMeta = spotMetas.spotMeta.tokens[universe.tokens[0]];

    if (!baseTokenMeta) return null;

    const ctx = spotAssetCtxs[universe.name];
    const priceChange = Number(ctx.markPx) - Number(ctx.prevDayPx);
    const price = Number(ctx.midPx || ctx?.markPx);

    return {
      price,
      pxDecimals: getPriceDecimals(price, baseTokenMeta.szDecimals, true),
      priceChange,
      priceChangePercent: (priceChange / Number(ctx.prevDayPx)) * 100,
    };
  }, [spotAssetCtxs, spotMetas, recurringPayload]);

  if (!recurringPayload) return null;

  return (
    <div className="w-full flex items-center justify-between gap-2 my-6">
      <div className="flex-1 flex items-center divide-x divide-neutral-gray-200">
        <div className="w-fit pr-4">
          <p className="text-xs font-medium text-neutral-gray-400">
            Price To Beat
          </p>
          <p className="text-base font-medium text-neutral-gray-400">
            {formatPriceToDecimal(
              Number(recurringPayload.targetPrice),
              activeAsset?.pxDecimals ?? 2,
              { style: "currency", useFallback: true },
            )}
          </p>
        </div>
        {activeAsset && (
          <div className="w-fit pl-4">
            <div className="text-xs font-medium text-primary flex items-center gap-1">
              <p>Current Price</p>
              <div
                className={cn("text-xs font-medium flex items-center", {
                  "text-buy": activeAsset.priceChange > 0,
                  "text-sell": activeAsset.priceChange < 0,
                })}
              >
                <ArrowUp
                  className={cn("text-buy size-4 rotate-180", {
                    "text-sell": activeAsset.priceChange < 0,
                  })}
                />

                <p>
                  <span>
                    {formatPriceToDecimal(
                      activeAsset.priceChange,
                      activeAsset.pxDecimals,
                      { style: "currency" },
                    )}
                  </span>
                  <span className="ml-1">
                    (
                    {formatNumber(activeAsset.priceChangePercent / 100, {
                      style: "percent",
                      useFallback: true,
                      useSign: true,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </span>
                </p>
              </div>
            </div>
            <p className="text-base font-medium text-primary">
              {formatPriceToDecimal(
                Number(activeAsset.price),
                activeAsset.pxDecimals,
                { style: "currency", useFallback: true },
              )}
            </p>
          </div>
        )}
      </div>
      <Countdown expiry={recurringPayload.expiry} />
    </div>
  );
};

const Countdown = ({ expiry }: { expiry: string }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiryDate = parseExpiry(expiry);
      const diff = expiryDate.getTime() - now;
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiry]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  //   Let's append 0 to the minutes and seconds if they are less than 10
  const minutes =
    `0${Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))}`.slice(-2);
  const seconds = `0${Math.floor((timeLeft % (1000 * 60)) / 1000)}`.slice(-2);

  if (timeLeft <= 0)
    return (
      <Button
        variant="secondary"
        className="size-fit flex items-center gap-1 rounded-full px-3 py-1.5"
        onClick={() => {
          // Handle implementation here to refresh the current market
          // Steps to consider when implementing this
          // 1. Update state
          // 2. Update URL if event date is different from the current date
          router.refresh();
        }}
      >
        <p className="text-sm font-medium text-neutral-gray-100">
          Go to live market
        </p>
        <ChevronRight className="size-4 text-neutral-gray-100" />
      </Button>
    );

  return (
    <div className="flex items-center gap-2">
      <Visibility visible={days > 0}>
        <TimeDisplay value={days} label="DAYS" />
      </Visibility>
      <Visibility visible={hours > 0}>
        <TimeDisplay value={hours} label="HRS" />
      </Visibility>
      <TimeDisplay value={minutes} label="MINS" />
      <TimeDisplay value={seconds} label="SECS" />
    </div>
  );
};

const TimeDisplay = ({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-base font-medium text-sell">{value}</p>
      <p className="text-xs font-medium text-neutral-gray-400">{label}</p>
    </div>
  );
};

export default LiveMarketDetails;
