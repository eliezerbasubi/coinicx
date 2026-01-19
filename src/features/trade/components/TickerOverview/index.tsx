"use client";

import React from "react";
import { useDocumentTitle, useMediaQuery } from "usehooks-ts";

import { useSubscription } from "@/hooks/useSubscription";
import Visibility from "@/components/common/Visibility";
import { hlSubClient } from "@/services/transport";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";
import {
  formatNumber,
  formatNumberWithFallback,
} from "@/utils/formatting/numbers";

import AssetsSelector from "./AssetsSelector";

const TickerOverview = () => {
  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  const base = useTradeContext((state) => state.base);
  const quote = useTradeContext((state) => state.quote);
  const instrumentType = useTradeContext((state) => state.instrumentType);
  const setTokenCtx = useInstrumentStore((state) => state.setAssetCtx);

  const tokenCtx = useInstrumentStore((state) => state.assetCtx);

  const tokenMeta = useInstrumentStore((state) => state.assetMeta);

  const coin = tokenMeta?.coin;
  const close = tokenCtx?.prevDayPx ?? 0;
  const open = tokenCtx?.markPx ?? 0;

  const isBuyOrder = close > open;

  const change = open - close;
  const changeInPercentage = (change / close) * 100;
  const price = tokenCtx?.midPx ?? tokenCtx?.markPx ?? 0;

  const assetFullName = tokenMeta?.fullName ?? tokenMeta?.base;

  useDocumentTitle(
    `${formatNumber(price, { minimumFractionDigits: 2 })} | ${base} ${quote} | ${assetFullName} to ${quote} - CoinicX Spot`,
  );

  useSubscription(() => {
    if (!coin) return;

    if (instrumentType === "spot") {
      return hlSubClient.activeSpotAssetCtx({ coin }, (data) => {
        setTokenCtx(data.ctx);
      });
    }

    return hlSubClient.activeAssetCtx({ coin }, (data) => {
      setTokenCtx(data.ctx);
    });
  }, [coin, instrumentType]);

  const formatBigValue = (value?: string | number) => {
    return formatNumberWithFallback(Number(value), {
      notation: isMobile && Number(value) >= 1e6 ? "compact" : undefined,
    });
  };

  return (
    <div className="w-full flex md:items-center md:gap-6 bg-primary-dark p-4 md:rounded-md">
      <div className="flex flex-col md:flex-row md:gap-6 flex-1 md:flex-none">
        <AssetsSelector />

        <div className="mt-0">
          <div className="flex-1">
            <Visibility visible={isMobile && instrumentType === "perps"}>
              <p className="text-[10px] text-neutral-gray-400 font-medium mt-0.5">
                Last Price
              </p>
            </Visibility>
            <p
              className={cn("text-xl text-buy font-bold", {
                "text-sell": !isBuyOrder,
              })}
            >
              {formatNumberWithFallback(price, { minimumFractionDigits: 2 })}
            </p>

            <p className="text-xs font-semibold">
              <span>
                {formatNumberWithFallback(price, {
                  style: "currency",
                  minimumFractionDigits: 2,
                })}
              </span>

              <Visibility visible={isMobile}>
                <span
                  className={cn("text-xs text-buy ml-1", {
                    "text-sell": !isBuyOrder,
                  })}
                >
                  {tokenCtx && change >= 0 && "+"}
                  {formatNumberWithFallback(changeInPercentage / 100, {
                    style: "percent",
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </span>
              </Visibility>
            </p>
          </div>

          <Visibility visible={isMobile && instrumentType === "perps"}>
            <div className="flex items-center gap-x-1 font-medium mt-0.5">
              <p className="text-[10px] text-neutral-gray-400">Mark Price</p>

              <p className="text-[10px]">
                {formatNumberWithFallback(tokenCtx?.markPx ?? 0)}
              </p>
            </div>
          </Visibility>
        </div>
      </div>

      <div className="grid grid-cols-2 self-end md:self-auto md:flex items-center gap-2 md:gap-4 md:overflow-x-auto no-scrollbars">
        <Visibility visible={!isMobile && instrumentType === "perps"}>
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
                  maximumFractionDigits: 2,
                })}
              </p>
            }
            className={cn("text-buy", {
              "text-sell": changeInPercentage < 0,
            })}
          />
        </Visibility>
        <TickerItem
          label={isMobile ? `24H Vol(${base})` : `24H Volume(${base})`}
          value={formatBigValue(tokenCtx?.dayBaseVlm)}
        />
        <TickerItem
          label={isMobile ? `24H Vol(${quote})` : `24H Volume(${quote})`}
          value={formatBigValue(tokenCtx?.dayNtlVlm)}
        />

        <Visibility visible={instrumentType === "perps"}>
          <TickerItem
            label="Open Interest"
            value={tokenCtx?.openInterest ?? 0}
          />
          <TickerItem
            label="Funding"
            value={
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
            }
          />
        </Visibility>
        <Visibility visible={instrumentType === "spot"}>
          <TickerItem
            label="Market Cap"
            value={formatBigValue(Number(tokenCtx?.marketCap ?? 0))}
          />
        </Visibility>
      </div>
    </div>
  );
};

type TickerItemProps = {
  label: string;
  value?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
};

const TickerItem = ({ label, value, className, suffix }: TickerItemProps) => {
  return (
    <div className="w-fit">
      <p className="text-neutral-gray-400 text-[10px] md:text-xs pb-0.5 md:mb-1 md:whitespace-nowrap">
        {label}
      </p>

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
