import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import TokenImage from "@/features/trade/components/TokenImage";
import { formatTwapRuntime } from "@/features/trade/utils/twap";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import {
  formatNumber,
  formatNumberWithFallback,
} from "@/utils/formatting/numbers";

import CardItem from "../CardItem";
import CoinLink from "../CoinLink";
import { useSpotToTokenDetails } from "../hooks/useSpotToTokenDetails";

type ActiveTwap = {
  coin: string;
  dex: string | null;
  base: string;
  symbol: string;
  href: string;
  averagePx: number;
  executedSz: number;
  minutes: number;
  randomize: boolean;
  reduceOnly: boolean;
  side: "B" | "A";
  sz: number;
  timestamp: number;
};

const columns: ColumnDef<ActiveTwap>[] = [
  {
    header: "Coin",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return (
        <CoinLink
          symbol={original.symbol}
          dex={original.dex}
          href={original.href}
        />
      );
    },
  },
  {
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.sz))} {original.coin}
        </span>
      );
    },
  },
  {
    id: "executedSize",
    header: "Executed Size",
    cell({ row: { original } }) {
      return (
        <span className="text-buy">
          {formatNumber(Number(original.executedSz))} {original.coin}
        </span>
      );
    },
  },
  {
    id: "averagePrice",
    header: "Average Price",
    cell({ row: { original } }) {
      return (
        <span className="text-buy">
          {formatNumberWithFallback(original.averagePx)}
        </span>
      );
    },
  },
  {
    id: "runningTime",
    header: "Running Time / Total",
    cell({ row: { original } }) {
      return (
        <span>
          {formatTwapRuntime({
            totalMinutes: original.minutes,
            startTimestamp: original.timestamp,
            includeElapsed: true,
          })}
        </span>
      );
    },
  },
  {
    id: "reduceOnly",
    header: "Reduce Only",
    cell({ row: { original } }) {
      return <span>{original.reduceOnly ? "Yes" : "No"}</span>;
    },
  },
  {
    id: "creationTime",
    header: "Creation Time",
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "terminate",
    header: "Terminate",
    cell() {
      return (
        <button type="button" className="text-sell text-xs font-medium">
          Terminate
        </button>
      );
    },
  },
];

const ActiveTWAPs = () => {
  const { mapSpotNameToTokenDetails } = useSpotToTokenDetails();

  const twaps = useShallowUserTradeStore((s) => s.twapStates.twaps);

  const data = useMemo(() => {
    return Array.from(new Map(twaps).values()).map((twap) => {
      const tokenDetails = mapSpotNameToTokenDetails(twap.coin);
      const executedSz = Number(twap.executedSz);
      const avgPx = executedSz ? Number(twap.executedNtl) / executedSz : 0;

      return {
        timestamp: twap.timestamp,
        dex: tokenDetails.dex,
        base: tokenDetails.base,
        symbol: tokenDetails.symbol,
        coin: tokenDetails.coin,
        href: tokenDetails.href,
        averagePx: avgPx,
        side: twap.side,
        executedSz,
        sz: Number(twap.sz),
        minutes: twap.minutes,
        reduceOnly: twap.reduceOnly,
        randomize: twap.randomize,
      };
    });
  }, [mapSpotNameToTokenDetails, twaps]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={false}
      className="space-y-1.5 mb-3"
      wrapperClassName="p-4 md:p-4"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry: ActiveTwap) => <ActiveTwapCard data={entry} />}
      noData="No active TWAPs yet"
      disablePagination
    />
  );
};

const ActiveTwapCard = ({ data }: { data: ActiveTwap }) => {
  const isSell = data.side === "A";

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.base}
              className="size-4"
              instrumentType="perps"
            />
            <span className="text-sm text-neutral-gray-100 font-medium line-clamp-1">
              {data.base}
            </span>
          </div>
          {data.dex && <Tag value={data.dex} />}
          <Tag
            value={isSell ? "Sell" : "Buy"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": isSell,
            })}
          />
        </div>

        <p className="text-xs text-neutral-gray-400">
          {formatTwapRuntime({
            totalMinutes: data.minutes,
            startTimestamp: data.timestamp,
            includeElapsed: true,
            excludeTotal: true,
          })}
        </p>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem
          label="Size"
          value={`${formatNumber(Number(data.sz))} ${data.coin}`}
        />
        <CardItem
          label="Executed Size"
          value={`${formatNumber(data.executedSz)} ${data.coin}`}
        />
        <CardItem
          label="Average Price"
          value={formatNumberWithFallback(data.averagePx)}
        />
        <CardItem
          label="Total Time"
          value={formatTwapRuntime({
            totalMinutes: data.minutes,
            startTimestamp: data.timestamp,
            includeElapsed: false,
          })}
        />
      </div>

      <div className="mt-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-7"
          label="Terminate"
        />
      </div>
    </div>
  );
};

export default ActiveTWAPs;
