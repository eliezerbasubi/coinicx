"use client";

import React, { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

const TickerOverview = () => {
  const isMobile = useMediaQuery("(max-width: 768px)", {
    initializeWithValue: false,
  });

  const baseAsset = useTradeContext((state) => state.baseAsset);
  const quoteAsset = useTradeContext((state) => state.quoteAsset);
  const marketTicker = useTradeContext((state) => state.marketTicker);

  const close = marketTicker?.c ?? 0;
  const open = marketTicker?.o ?? 0;

  const isBuyOrder = close > open;

  const change = ((close - open) / close) * 100;

  useEffect(() => {
    if (!marketTicker) return;

    document.title = `${formatNumber(marketTicker.c, { minimumFractionDigits: 2 })} | ${baseAsset} ${quoteAsset} | ${marketTicker.an} to ${marketTicker.qn} - CoinicX Spot`;
  }, [marketTicker, baseAsset, quoteAsset]);

  return (
    <div className="w-full flex md:items-center md:flex-wrap md:gap-6 bg-primary-dark p-4 md:rounded-md">
      <div className="flex flex-col md:flex-row md:gap-6 flex-1 md:flex-auto">
        <div className="flex items-center space-x-2">
          <div className="size-5 md:size-8 rounded-full bg-teal-500" />
          <div className="flex-1">
            <p className="text-lg md:text-xl font-bold">
              {baseAsset}/{quoteAsset}
            </p>
            {!isMobile && (
              <p className="text-xs text-neutral-gray-400 font-medium">Spot</p>
            )}
          </div>
        </div>

        <div>
          <p
            className={cn("text-xl text-buy font-bold", {
              "text-sell": !isBuyOrder,
            })}
          >
            {(close && formatNumber(close, { minimumFractionDigits: 2 })) ||
              "--"}
          </p>

          <div className="flex items-center">
            <p className="text-xs md:font-semibold">
              {/* TODO: Use correct dollar conversion here */}
              {(close &&
                formatNumber(close, {
                  style: "currency",
                  minimumFractionDigits: 2,
                })) ||
                "--"}
            </p>

            {isMobile && (
              <p
                className={cn("text-xs text-buy ml-1", {
                  "text-sell": !isBuyOrder,
                })}
              >
                {formatNumber(change, {
                  style: "currency",
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex items-center gap-2 md:gap-4">
        {!isMobile && (
          <TickerItem label="24H Change" percentage={change} percentageOnly />
        )}
        <TickerItem label="24H High" value={marketTicker?.h} />
        <TickerItem label="24H Low" value={marketTicker?.l} />
        <TickerItem
          label={
            isMobile ? `24H Vol(${baseAsset})` : `24H Volume(${baseAsset})`
          }
          value={marketTicker?.v}
        />
        <TickerItem
          label={
            isMobile ? `24H Vol(${quoteAsset})` : `24H Volume(${quoteAsset})`
          }
          value={marketTicker?.qv}
          compactNumbers={isMobile && Number(marketTicker?.qv ?? 0) >= 1e6}
        />
      </div>
    </div>
  );
};

type TickerItemProps = {
  label: string;
  value?: number;
  percentage?: number;
  percentageOnly?: boolean;
  compactNumbers?: boolean;
};

const TickerItem = ({
  label,
  value,
  percentage,
  percentageOnly,
  compactNumbers,
}: TickerItemProps) => {
  return (
    <div className="w-fit">
      <p className="text-neutral-gray-400 text-[10px] md:text-xs pb-0.5 md:mb-1">
        {label}
      </p>

      <div
        className={cn(
          "flex items-center text-xs font-medium space-x-1 lining-nums tabular-nums",
          {
            "text-sell": percentage !== undefined && percentage < 0,
            "text-buy": percentage !== undefined && percentage >= 0,
          },
        )}
      >
        {!percentageOnly && (
          <p>
            {(value !== undefined &&
              formatNumber(value, {
                minimumFractionDigits: 2,
                notation: compactNumbers ? "compact" : undefined,
              })) ||
              "--"}
          </p>
        )}

        {percentage !== undefined && (
          <p>
            {percentage >= 0 && "+"}
            {percentage.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
};

export default TickerOverview;
