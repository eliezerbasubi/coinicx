"use client";

import React from "react";
import {
  ActiveAssetCtxWsEvent,
  ActiveSpotAssetCtxWsEvent,
} from "@nktkas/hyperliquid";
import { useDocumentTitle } from "usehooks-ts";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useSubscription } from "@/hooks/useSubscription";
import Visibility from "@/components/common/Visibility";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { formatPriceToDecimal } from "@/features/trade/utils";
import { getPriceDecimals } from "@/features/trade/utils/prices";
import { hlSubClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useInstrumentStore,
  useShallowInstrumentStore,
} from "@/store/trade/instrument";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { cn } from "@/utils/cn";
import { formatNumberWithFallback } from "@/utils/formatting/numbers";

import AssetsSelector from "./AssetsSelector";
import FundingCountdown from "./FundingCountdown";

const TickerOverview = () => {
  const isMobile = useIsMobile();

  const { base, quote, instrumentType, setDecimals, decimals } =
    useTradeContext((state) => ({
      base: state.base,
      quote: state.quote,
      instrumentType: state.instrumentType,
      decimals: state.decimals,
      setDecimals: state.setDecimals,
    }));

  const { tokenCtx, tokenMeta } = useShallowInstrumentStore((state) => ({
    tokenCtx: state.assetCtx,
    tokenMeta: state.assetMeta,
  }));

  const coin = tokenMeta?.coin;
  const prevDayPx = tokenCtx?.prevDayPx ?? 0;
  const markPx = tokenCtx?.markPx ?? 0;

  const change = markPx - prevDayPx;
  const changeInPercentage = (change / prevDayPx) * 100;

  const price = tokenCtx?.midPx ?? tokenCtx?.markPx ?? 0;

  const assetFullName = tokenMeta?.fullName ?? tokenMeta?.base;
  const isSpot = instrumentType === "spot";

  useDocumentTitle(
    `${formatPriceToDecimal(price, decimals)} | ${base} ${quote} | ${assetFullName} to ${quote} - CoinicX Spot`,
  );

  const setTokenCtxAndTicks = (
    data: ActiveSpotAssetCtxWsEvent["ctx"] | ActiveAssetCtxWsEvent["ctx"],
  ) => {
    const price = Number(data.midPx ?? data.markPx);
    const szDecimals = Number(tokenMeta?.szDecimals);

    // Update asset context
    useInstrumentStore.getState().setAssetCtx(data);

    const { ticks, setTicks } = useOrderBookStore.getState();
    if (ticks.length === 0) {
      setTicks(price, szDecimals, isSpot);
    }

    if (decimals === null) {
      const priceDecimals = getPriceDecimals(price, szDecimals, isSpot);
      setDecimals(priceDecimals);
    }
  };

  useSubscription(() => {
    if (!coin) return;

    if (instrumentType === "spot") {
      return hlSubClient.activeSpotAssetCtx({ coin }, (data) => {
        setTokenCtxAndTicks(data.ctx);
      });
    }

    return hlSubClient.activeAssetCtx({ coin }, (data) => {
      setTokenCtxAndTicks(data.ctx);
    });
  }, [coin, instrumentType]);

  const formatBigValue = (
    value?: string | number,
    options?: Intl.NumberFormatOptions,
  ) => {
    return formatNumberWithFallback(Number(value), {
      notation: isMobile && Number(value) >= 1e6 ? "compact" : undefined,
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 10,
      ...options,
    });
  };

  return (
    <div className="w-full flex md:items-center md:gap-6 bg-primary-dark p-4 md:rounded-md">
      <div className="flex flex-col md:flex-row md:gap-6 flex-1 md:flex-none">
        <AssetsSelector />

        <div className="mt-0">
          <div className="flex-1">
            <Visibility visible={isMobile && !isSpot}>
              <p className="text-[10px] text-neutral-gray-400 font-medium mt-0.5">
                Last Price
              </p>
            </Visibility>
            <p
              className={cn("text-xl text-buy font-bold", {
                "text-sell": markPx > prevDayPx,
              })}
            >
              {formatNumberWithFallback(price, {
                minimumFractionDigits: decimals ?? 0,
                maximumFractionDigits: decimals ?? 5,
              })}
            </p>

            {/* Price dollar value conversion */}
            <p className="text-xs font-semibold">
              <span>
                {formatNumberWithFallback(price, {
                  style: "currency",
                })}
              </span>

              <Visibility visible={isMobile}>
                <span
                  className={cn("text-xs text-buy ml-1", {
                    "text-sell": change < 0,
                  })}
                >
                  {tokenCtx && change >= 0 && "+"}
                  {formatNumberWithFallback(changeInPercentage / 100, {
                    style: "percent",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Visibility>
            </p>
          </div>

          <Visibility visible={isMobile && !isSpot}>
            <div className="flex items-center gap-x-1 font-medium mt-0.5">
              <p className="text-[10px] text-neutral-gray-400">Mark Price</p>

              <p className="text-[10px]">
                {formatNumberWithFallback(tokenCtx?.markPx ?? 0, {
                  minimumFractionDigits: decimals ?? 0,
                  maximumFractionDigits: decimals ?? 5,
                })}
              </p>
            </div>
          </Visibility>
        </div>
      </div>

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
                {tokenCtx && change >= 0 && "+"}
                {formatNumberWithFallback(changeInPercentage / 100, {
                  style: "percent",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            }
            className={cn("text-buy", {
              "text-sell": change < 0,
            })}
          />
        </Visibility>
        <TickerItem
          label={isMobile ? `24H Vol(${base})` : `24H Volume(${base})`}
          value={formatBigValue(tokenCtx?.dayBaseVlm, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        />
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
            value={formatBigValue(tokenCtx?.openInterest ?? 0, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          />
          <TickerItem
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
                  {formatNumberWithFallback(tokenCtx?.funding ?? 0, {
                    style: "percent",
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
    </div>
  );
};

type TickerItemProps = {
  label: React.ReactNode;
  value?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
};

const TickerItem = ({ label, value, className, suffix }: TickerItemProps) => {
  return (
    <div className="w-fit">
      <div className="text-neutral-gray-400 text-[10px] md:text-xs pb-0.5 md:mb-1 md:whitespace-nowrap">
        {label}
      </div>

      <div
        className={cn(
          "flex items-center text-xs font-medium space-x-1 lining-nums tabular-nums",
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
