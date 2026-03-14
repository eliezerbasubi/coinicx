"use client";

import React, { Activity } from "react";
import { useDocumentTitle } from "usehooks-ts";

import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { formatPriceToDecimal } from "@/features/trade/utils";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { usePreferencesStore } from "@/store/trade/user-preferences";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import AssetsSelector from "./AssetsSelector";
import FundingCountdown from "./FundingCountdown";

const TickerOverview = () => {
  const isMobile = useIsMobile();

  const { base, quote, decimals } = useTradeContext((state) => ({
    base: state.base,
    quote: state.quote,
    decimals: state.decimals,
  }));

  const { assetPrice, assetFullName } = useShallowInstrumentStore((s) => ({
    assetPrice: s.assetCtx?.midPx || s.assetCtx?.markPx || 0,
    assetFullName: s.assetMeta?.fullName ?? s.assetMeta?.base,
  }));

  const mobileViewTab = usePreferencesStore((s) => s.mobileViewTab);

  useDocumentTitle(
    `${formatPriceToDecimal(assetPrice, decimals)} | ${base} ${quote} ${assetFullName && `| ${assetFullName} to ${quote}`} - CoinicX`,
  );

  return (
    <div className="w-full grid grid-cols-2 md:flex md:items-center md:gap-6 bg-primary-dark p-4 md:rounded-md">
      <AssetsSelector className="col-span-2" />

      <Activity
        mode={!isMobile || mobileViewTab !== "trade" ? "visible" : "hidden"}
      >
        <TickerPrice />

        <TickerContext />
      </Activity>
    </div>
  );
};

const TickerPrice = () => {
  const isMobile = useIsMobile();

  const { decimals, isSpot } = useTradeContext((s) => ({
    decimals: s.decimals,
    isSpot: s.instrumentType === "spot",
  }));

  const tokenCtx = useShallowInstrumentStore((s) => ({
    markPx: s.assetCtx?.markPx ?? 0,
    midPx: s.assetCtx?.midPx ?? 0,
    prevDayPx: s.assetCtx?.prevDayPx ?? 0,
  }));

  const price = tokenCtx.midPx || tokenCtx.markPx;

  const change = tokenCtx.markPx - tokenCtx.prevDayPx;
  const changeInPercentage = (change / tokenCtx.prevDayPx) * 100;

  return (
    <div className="flex-1 md:flex-none">
      <div className="flex-1">
        <Visibility visible={isMobile}>
          <p className="text-2xs text-neutral-gray-400 font-medium mt-0.5">
            Last Price
          </p>
        </Visibility>
        <p
          className={cn("text-xl text-buy font-bold", {
            "text-sell": tokenCtx.markPx > tokenCtx.prevDayPx,
          })}
        >
          {formatPriceToDecimal(price, decimals, {
            useFallback: true,
          })}
        </p>

        {/* Price dollar value conversion */}
        <p className="text-xs font-semibold">
          <span>
            {formatNumber(price, {
              style: "currency",
              useFallback: true,
            })}
          </span>

          <Visibility visible={isMobile}>
            <span
              className={cn("text-xs text-buy ml-1", {
                "text-sell": changeInPercentage < 0,
              })}
            >
              {formatNumber(changeInPercentage / 100, {
                style: "percent",
                useFallback: true,
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </Visibility>
        </p>
      </div>

      <Visibility visible={isMobile && !isSpot}>
        <div className="flex items-center gap-x-1 font-medium mt-0.5">
          <p className="text-2xs text-neutral-gray-400">Mark Price</p>

          <p className="text-2xs">
            {formatPriceToDecimal(tokenCtx.markPx, decimals, {
              useFallback: true,
            })}
          </p>
        </div>
      </Visibility>
    </div>
  );
};

const TickerContext = () => {
  const isMobile = useIsMobile();

  const { base, quote, instrumentType, decimals } = useTradeContext(
    (state) => ({
      base: state.base,
      quote: state.quote,
      instrumentType: state.instrumentType,
      decimals: state.decimals,
    }),
  );

  const { tokenCtx } = useShallowInstrumentStore((state) => ({
    tokenCtx: state.assetCtx,
  }));

  const prevDayPx = tokenCtx?.prevDayPx ?? 0;
  const markPx = tokenCtx?.markPx ?? 0;

  const change = markPx - prevDayPx;
  const changeInPercentage = (change / prevDayPx) * 100;

  const isSpot = instrumentType === "spot";

  const formatBigValue = (
    value?: string | number,
    options?: Intl.NumberFormatOptions,
  ) => {
    return formatNumber(Number(value), {
      useFallback: true,
      notation: isMobile && Number(value) >= 1e6 ? "compact" : undefined,
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 10,
      ...options,
    });
  };

  return (
    <div className="grid grid-cols-2 self-end md:self-auto md:flex items-center gap-2 md:gap-4 md:overflow-x-auto no-scrollbars">
      <Visibility visible={!isMobile && !isSpot}>
        <TickerItem
          label="Oracle Price"
          value={formatBigValue(tokenCtx?.oraclePx ?? 0)}
        />
      </Visibility>
      <Visibility visible={!isMobile}>
        <TickerItem
          label="24H Change"
          value={formatBigValue(change)}
          suffix={
            <p>
              {formatNumber(changeInPercentage / 100, {
                style: "percent",
                useFallback: true,
                useSign: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          }
          className={cn("text-buy", {
            "text-sell": changeInPercentage < 0,
          })}
        />
      </Visibility>

      {/* Hide base 2h vol on mobile for perps */}
      <Visibility visible={!isMobile || isSpot}>
        <TickerItem
          label={isMobile ? `24H Vol(${base})` : `24H Volume(${base})`}
          value={formatBigValue(tokenCtx?.dayBaseVlm, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
      </Visibility>
      <TickerItem
        label={isMobile ? `24H Vol(${quote})` : `24H Volume(${quote})`}
        value={formatBigValue(tokenCtx?.dayNtlVlm, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      />

      <Visibility visible={!isSpot}>
        <TickerItem
          label="Open Interest"
          value={formatBigValue((tokenCtx?.openInterest ?? 0) * markPx, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
        <TickerItem
          wrapperClassName="col-span-2"
          label={
            <AdaptiveTooltip
              variant="underline"
              title="Funding Rate"
              trigger={
                <p className="space-x-0.5">
                  <span>Funding Rate</span>
                  <span>/</span>
                  <span>Countdown</span>
                </p>
              }
            >
              <p>
                Funding rate is the interest rate paid between long and short
                positions in a perpetual futures contract.
              </p>
            </AdaptiveTooltip>
          }
          value={
            <span className="flex items-center gap-1">
              <span
                className={cn("text-buy", {
                  "text-sell": Number(tokenCtx?.funding ?? 0) < 0,
                })}
              >
                {formatNumber(tokenCtx?.funding ?? 0, {
                  style: "percent",
                  useFallback: true,
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </span>
              <span>/</span>
              <FundingCountdown />
            </span>
          }
        />
      </Visibility>
      <Visibility visible={instrumentType === "spot"}>
        <TickerItem
          label="Market Cap"
          value={formatBigValue(Number(tokenCtx?.marketCap ?? 0), {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
      </Visibility>
    </div>
  );
};

type TickerItemProps = {
  label: React.ReactNode;
  value?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
};

const TickerItem = ({
  label,
  value,
  className,
  suffix,
  wrapperClassName,
}: TickerItemProps) => {
  return (
    <div className={cn("w-fit", wrapperClassName)}>
      <div className="text-neutral-gray-400 text-2xs md:text-xs md:pb-0.5 md:mb-1 md:whitespace-nowrap">
        {label}
      </div>

      <div
        className={cn(
          "flex items-center text-3xs md:text-xs font-medium space-x-1 lining-nums tabular-nums",
          className,
        )}
      >
        <p>{value}</p>

        {suffix}
      </div>
    </div>
  );
};

export default TickerOverview;
