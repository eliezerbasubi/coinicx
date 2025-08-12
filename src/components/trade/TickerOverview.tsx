"use client";

import React from "react";

import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

const TickerOverview = () => {
  const baseAsset = useTradeContext((state) => state.baseAsset);
  const quoteAsset = useTradeContext((state) => state.quoteAsset);
  const marketTicker = useTradeContext((state) => state.marketTicker);

  const close = marketTicker?.c ?? 0;
  const open = marketTicker?.o ?? 0;

  const isBuyOrder = close > open;

  const change = ((close - open) / close) * 100;

  return (
    <div className="w-full flex items-center gap-x-6 bg-primary-dark p-4 rounded-md">
      <div className="flex items-center space-x-2">
        <div className="size-8 rounded-full bg-teal-500" />
        <div className="flex-1">
          <p className="text-xl font-bold">
            {baseAsset}/{quoteAsset}
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium">Spot</p>
        </div>
      </div>

      <div>
        <p
          className={cn("text-xl text-buy font-bold", {
            "text-sell": !isBuyOrder,
          })}
        >
          {(close && formatNumber(close, { minimumFractionDigits: 2 })) || "--"}
        </p>
        <p className="text-xs font-semibold">
          {/* Use correct dollar converted value here */}
          {(close &&
            formatNumber(close, {
              style: "currency",
              minimumFractionDigits: 2,
            })) ||
            "--"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <TickerItem label="24H Change" percentage={change} percentageOnly />
        <TickerItem label="24H High" value={marketTicker?.h} />
        <TickerItem label="24H Low" value={marketTicker?.l} />
        <TickerItem
          label={`24H Volume(${baseAsset})`}
          value={marketTicker?.v}
        />
        <TickerItem
          label={`24H Volume(${quoteAsset})`}
          value={marketTicker?.qv}
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
};

const TickerItem = ({
  label,
  value,
  percentage,
  percentageOnly,
}: TickerItemProps) => {
  return (
    <div className="w-fit text-xs">
      <p className="text-neutral-gray-400 mb-1">{label}</p>

      <div
        className={cn(
          "flex items-center font-medium space-x-1 lining-nums tabular-nums",
          {
            "text-sell": percentage !== undefined && percentage < 0,
            "text-buy": percentage !== undefined && percentage >= 0,
          },
        )}
      >
        {!percentageOnly && (
          <p>
            {(value && formatNumber(value, { minimumFractionDigits: 2 })) ||
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
