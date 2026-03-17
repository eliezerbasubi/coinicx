"use client";

import { useMemo } from "react";

import { PortfolioType } from "@/types/portfolio";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/store/trade/user-preferences";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import { usePortfolioMetrics } from "../hooks/usePortfolioMetrics";

const PERIOD_LABELS: Record<string, string> = {
  day: "24H",
  week: "7D",
  month: "30D",
  allTime: "All Time",
};

const PortfolioOverview = () => {
  const { period, data, isLoading, metrics } = usePortfolioMetrics();
  const { perpsEquity, spotBalances, perpDexStates } = useShallowUserTradeStore(
    (s) => ({
      perpsEquity: Number(
        s.allDexsClearinghouseState?.marginSummary.accountValue ?? "0",
      ),
      spotBalances: s.spotBalances,
      perpDexStates: s.webData?.perpDexStates,
    }),
  );

  const { tokensToSpotId } = useMetaAndAssetCtxs();
  const spotAssetCtxsStore = useShallowInstrumentStore((s) => s.spotAssetCtxs);

  const spotBalanceInfo = useMemo(() => {
    if (!tokensToSpotId?.size)
      return {
        equity: 0,
        hypeMarkPx: 0,
      };

    return spotBalances.reduce(
      (acc, balance) => {
        const amount = Number(balance.total);
        if (balance.token === 0)
          return {
            equity: acc.equity + amount,
            hypeMarkPx: 0,
          };

        const tokenMap = tokensToSpotId.get(balance.token);

        if (!tokenMap) return acc;

        const spotId = tokenMap.get(0);

        if (spotId === undefined) return acc;

        const ctx = spotAssetCtxsStore[spotId];
        const markPx = Number(ctx?.markPx ?? "0");

        if (balance.coin === "HYPE") {
          acc.hypeMarkPx = markPx;
        }

        acc.equity = acc.equity + amount * markPx;

        return acc;
      },
      { equity: 0, hypeMarkPx: 0 },
    );
  }, [spotBalances, spotAssetCtxsStore, tokensToSpotId]);

  const totalVaultEquity = useMemo(() => {
    if (!perpDexStates?.length) return 0;

    return perpDexStates.reduce(
      (acc, perpDexState) => (acc += Number(perpDexState.totalVaultEquity)),
      0,
    );
  }, [perpDexStates]);

  const stakingValue = data?.stakingValue ?? 0;
  const stakingValueNtl = stakingValue * spotBalanceInfo.hypeMarkPx;

  const totalEquity =
    perpsEquity + spotBalanceInfo.equity + totalVaultEquity + stakingValueNtl;

  const todayPnl = metrics?.pnlHistory.length
    ? Number(metrics.pnlHistory.at(-1)?.[1] ?? "0")
    : 0;

  const todayVolume = Number(metrics?.vlm ?? "0");
  const periodLabel = PERIOD_LABELS[period];

  return (
    <div className="w-full md:max-w-72 bg-neutral-gray-200/50 rounded-md p-4 shrink-0 divide-y divide-neutral-gray-200">
      <div className="w-full pb-4">
        <div className="w-fit flex items-center gap-1 mb-3">
          <PortfolioTypeButton type="all" />
          <PortfolioTypeButton type="perps" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label={`${periodLabel} PNL`}
            loading={isLoading}
            value={
              <span
                className={cn("text-sm font-semibold", {
                  "text-buy": todayPnl >= 0,
                  "text-sell": todayPnl < 0,
                })}
              >
                {formatNumber(todayPnl, {
                  style: "currency",
                  useSign: true,
                  minimumFractionDigits: 2,
                })}
              </span>
            }
          />
          <StatTile
            label={`${periodLabel} Volume`}
            loading={isLoading}
            value={
              <span className="text-sm font-semibold text-white">
                {formatNumber(todayVolume, {
                  style: "currency",
                })}
              </span>
            }
          />
        </div>
      </div>

      {/* Equity breakdown */}
      <div className="space-y-2 pt-4">
        <EquityTile
          loading={isLoading}
          label="Total Equity"
          value={formatNumber(totalEquity, { style: "currency" })}
        />
        <EquityTile
          indent
          loading={isLoading}
          label="Perps Account"
          value={formatNumber(perpsEquity, { style: "currency" })}
        />
        <EquityTile
          indent
          loading={isLoading}
          label="Spot Account"
          value={formatNumber(spotBalanceInfo.equity, { style: "currency" })}
        />
        <EquityTile
          indent
          loading={isLoading}
          label="Vault Equity"
          value={formatNumber(totalVaultEquity, { style: "currency" })}
        />
        {/* <EquityTile
          indent
          loading={isLoading}
          label="Earn Balance"
          value={formatNumber(0, { style: "currency" })}
        /> */}
        <EquityTile
          indent
          loading={isLoading}
          label="Staking Account"
          value={formatNumber(stakingValue, {
            useFallback: true,
            maximumFractionDigits: 1,
            symbol: "HYPE",
          })}
        />
      </div>
    </div>
  );
};

const StatTile = ({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) => (
  <div className="space-y-0.5">
    <p className="text-xs text-neutral-gray-400">{label}</p>
    {loading ? <Skeleton className="w-24 h-4" /> : value}
  </div>
);

const EquityTile = ({
  label,
  value,
  loading,
  indent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
  indent?: boolean;
  className?: string;
}) => {
  return (
    <div
      key={label}
      className={cn("flex items-center justify-between text-xs", {
        "pl-3": indent,
      })}
    >
      <p className="text-neutral-gray-400">{label}</p>
      <Visibility
        visible={!loading}
        fallback={<Skeleton className="w-20 h-3.5" />}
      >
        <p className={cn("font-medium text-white", className)}>{value}</p>
      </Visibility>
    </div>
  );
};

const PortfolioTypeButton = ({ type }: { type: PortfolioType }) => {
  const isActive = useShallowPreferencesStore((s) => s.portfolioType === type);

  return (
    <Button
      variant="ghost"
      onClick={() =>
        usePreferencesStore.getState().dispatch({ portfolioType: type })
      }
      className={cn(
        "size-fit text-xs capitalize px-2 py-0.5 rounded font-medium text-neutral-gray-400 transition-colors",
        { "bg-neutral-gray-200 text-neutral-gray-100": isActive },
      )}
    >
      {type}
    </Button>
  );
};

export default PortfolioOverview;
