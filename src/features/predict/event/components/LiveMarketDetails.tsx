import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OutcomeMetaResponse } from "@nktkas/hyperliquid";
import { ArrowUp, ChevronRight } from "lucide-react";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { ROUTES } from "@/lib/constants/routes";
import { useInstrumentStore } from "@/lib/store/trade/instrument";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { useSpotAssetMeta } from "@/features/predict/hooks/useSpotMetas";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { ParsedRecurringPayload } from "@/features/predict/lib/types";
import { isRecurring } from "@/features/predict/lib/utils/outcomes";
import {
  parseExpiry,
  parseRecurringMetadata,
} from "@/features/predict/lib/utils/parseMetadata";
import { formatPriceToDecimal, getPriceDecimals } from "@/features/trade/utils";

const LiveMarketDetails = () => {
  const { recurringPayload, settledPrice } = useMarketEventContext((state) => ({
    recurringPayload: state.marketEventMeta.recurringPayload,
    settledPrice:
      state.marketEventMeta.settledDetails &&
      "price" in state.marketEventMeta.settledDetails
        ? state.marketEventMeta.settledDetails.price
        : null,
  }));

  const spotAssetCtxs = useInstrumentStore((s) => s.spotAssetCtxs);
  const spotAssetMeta = useSpotAssetMeta({
    assetName: recurringPayload?.underlying ?? null,
  });

  const activeAsset = useMemo(() => {
    if (!recurringPayload || !spotAssetMeta) return null;

    const ctx = spotAssetCtxs[spotAssetMeta.universe.name];
    const markPx = Number(ctx?.markPx || 0);
    const prevDayPx = Number(ctx?.prevDayPx || 0);
    const priceChange = markPx - prevDayPx;
    const price = Number(ctx?.midPx || markPx);

    return {
      price,
      pxDecimals: ctx
        ? getPriceDecimals(price, spotAssetMeta.meta.szDecimals, true)
        : 2,
      priceChange,
      priceChangePercent: prevDayPx ? (priceChange / prevDayPx) * 100 : 0,
    };
  }, [spotAssetCtxs, spotAssetMeta, recurringPayload]);

  if (!recurringPayload) return null;

  const priceChange = settledPrice
    ? Number(settledPrice) - Number(recurringPayload.targetPrice)
    : (activeAsset?.priceChange ?? 0);

  const priceChangePercent = settledPrice
    ? priceChange / 100
    : (activeAsset?.priceChangePercent ?? 0);

  const price = settledPrice ? Number(settledPrice) : (activeAsset?.price ?? 0);

  return (
    <div className="w-full flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 md:gap-2 mb-6 md:my-6">
      <div className="flex-1 flex items-center divide-x divide-neutral-gray-200">
        <div className="w-fit pr-4">
          <p className="text-sm font-medium text-neutral-gray-400">
            Price To Beat
          </p>
          <p className="text-xl font-bold text-neutral-gray-400">
            {formatPriceToDecimal(
              Number(recurringPayload.targetPrice),
              activeAsset?.pxDecimals ?? 2,
              { style: "currency", useFallback: true },
            )}
          </p>
        </div>
        {activeAsset && (
          <div className="w-fit pl-4">
            <div className="text-sm font-medium text-primary flex items-center gap-1">
              <p className={cn({ "text-neutral-gray-100": !!settledPrice })}>
                {settledPrice ? "Final Price" : "Current Price"}
              </p>
              <div
                className={cn(
                  "text-xs text-buy font-medium flex items-center",
                  {
                    "text-sell": priceChange < 0,
                  },
                )}
              >
                <ArrowUp className="size-4 rotate-180" />

                <p>
                  <span>
                    {formatPriceToDecimal(
                      priceChange,
                      activeAsset.pxDecimals ?? 2,
                      { style: "currency" },
                    )}
                  </span>
                  <span className="ml-1">
                    (
                    {formatNumber(priceChangePercent / 100, {
                      style: "percent",
                      useSign: true,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </span>
                </p>
              </div>
            </div>
            <p
              className={cn("text-xl font-bold text-primary", {
                "text-neutral-gray-100": !!settledPrice,
              })}
            >
              {formatPriceToDecimal(price, activeAsset.pxDecimals, {
                style: "currency",
                useFallback: true,
              })}
            </p>
          </div>
        )}
      </div>
      <Countdown recurringPayload={recurringPayload} />
    </div>
  );
};

const Countdown = ({
  recurringPayload,
}: {
  recurringPayload: ParsedRecurringPayload;
}) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiryDate = parseExpiry(recurringPayload.expiry);
      const diff = expiryDate.getTime() - now;
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [recurringPayload.expiry]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  //   Let's append 0 to the minutes and seconds if they are less than 10
  const minutes =
    `0${Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))}`.slice(-2);
  const seconds = `0${Math.floor((timeLeft % (1000 * 60)) / 1000)}`.slice(-2);

  if (timeLeft <= 0) {
    return (
      <Button
        variant="secondary"
        className="size-fit flex items-center gap-1 rounded-full px-3 py-1.5"
        onClick={() => {
          const queryClient = getQueryClient();

          const predictionMarketEvents =
            queryClient.getQueryData<OutcomeMetaResponse>([
              QUERY_KEYS.predictionMarketEvents,
            ]);

          if (!predictionMarketEvents) return;

          let metadata = null;
          for (const outcome of predictionMarketEvents.outcomes) {
            const parsedMetadata = isRecurring(outcome)
              ? parseRecurringMetadata(outcome.description, outcome.outcome)
              : null;

            if (!parsedMetadata) continue;

            if (
              parsedMetadata.class === recurringPayload.class &&
              parsedMetadata.underlying === recurringPayload.underlying &&
              parsedMetadata.period === recurringPayload.period
            ) {
              metadata = parsedMetadata;
              break;
            }
          }

          if (metadata) {
            router.replace(`${ROUTES.predict.event}/${metadata.slug}`);
          }
          // TODO: Handle the case where metadata is not found.
        }}
      >
        <p className="text-sm font-medium text-neutral-gray-100">
          Go to live market
        </p>
        <ChevronRight className="size-4 text-neutral-gray-100" />
      </Button>
    );
  }

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
