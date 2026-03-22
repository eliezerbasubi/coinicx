import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/formatting/dates";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import { formatTotalRuntime } from "@/features/trade/utils/twap";

import CardItem from "../CardItem";
import { useSpotToTokenDetails } from "../hooks/useSpotToTokenDetails";

type TwapHistory = {
  timestamp: number;
  coin: string;
  base: string;
  dex: string | null;
  symbol: string;
  href: string;
  sz: number;
  executedSz: number;
  averagePx: number;
  totalRuntime: number;
  reduceOnly: boolean;
  randomize: boolean;
  status: string;
};

const columns: ColumnDef<TwapHistory>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.timestamp,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "coin",
    header: "Coin",
    cell({ row: { original } }) {
      return (
        <Link
          href={original.href}
          className="font-medium hover:text-primary transition-colors"
        >
          {original.symbol}
        </Link>
      );
    },
  },
  {
    id: "totalSize",
    header: "Total Size",
    cell({ row: { original } }) {
      return (
        <span className="text-buy space-x-1">
          <span>
            {formatNumber(original.sz, {
              minimumFractionDigits: 2,
            })}
          </span>
          <span>{original.base}</span>
        </span>
      );
    },
  },
  {
    id: "executedSize",
    header: "Executed Size",
    cell({ row: { original } }) {
      const executedSz = original.executedSz;

      return (
        <span className="space-x-1 text-buy">
          <span>{formatNumber(executedSz, { useFallback: true })}</span>
          {!!executedSz && <span>{original.base}</span>}
        </span>
      );
    },
  },
  {
    id: "averagePrice",
    header: "Average Price",
    cell({ row: { original } }) {
      return (
        <span>{formatNumber(original.averagePx, { useFallback: true })}</span>
      );
    },
  },
  {
    id: "totalRuntime",
    header: "Total Runtime",
    cell({ row: { original } }) {
      return <span>{formatTotalRuntime(original.totalRuntime)}</span>;
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
    id: "randomize",
    header: "Randomize",
    cell({ row: { original } }) {
      return <span>{original.randomize ? "Yes" : "No"}</span>;
    },
  },
  {
    id: "status",
    header: "Status",
    cell({ row: { original } }) {
      return <span className="font-medium capitalize">{original.status}</span>;
    },
  },
];

const HistoryTWAPs = () => {
  const { mapSpotNameToTokenDetails } = useSpotToTokenDetails();
  const twapHistory = useShallowUserTradeStore((s) => s.twapStates.history);

  const data = useMemo(() => {
    return twapHistory.map((history) => {
      const tokenDetails = mapSpotNameToTokenDetails(history.state.coin);

      const avgPx = Number(history.state.executedSz)
        ? Number(history.state.executedNtl) / Number(history.state.executedSz)
        : 0;

      return {
        timestamp: history.time * 1000,
        href: tokenDetails.href,
        symbol: tokenDetails.symbol,
        coin: tokenDetails.coin,
        base: tokenDetails.base,
        dex: tokenDetails.dex,
        sz: Number(history.state.sz),
        executedSz: Number(history.state.executedSz),
        averagePx: avgPx,
        reduceOnly: history.state.reduceOnly,
        randomize: history.state.randomize,
        totalRuntime: history.state.minutes,
        status: history.status.status,
      };
    });
  }, [mapSpotNameToTokenDetails, twapHistory]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={false}
      initialState={{
        pagination: {
          pageIndex: 0,
          pageSize: 30,
        },
      }}
      className="space-y-1.5 mb-3"
      wrapperClassName="p-4 md:p-0"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      headerClassName="top-9" // Stick below the tabs
      render={(entry: TwapHistory) => <TwapHistoryCard data={entry} />}
      noData="No TWAP history yet"
      disablePagination
    />
  );
};

const TwapHistoryCard = ({ data }: { data: TwapHistory }) => {
  const status = data.status;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.coin}
              className="size-4"
              instrumentType={data.dex === null ? "spot" : "perps"}
            />
            <Link
              href={data.href}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {data.symbol}
            </Link>
          </div>
          {data.dex && <Tag value={data.dex} />}
          {data.randomize && <Tag value="Randomize" />}
          {data.reduceOnly && <Tag value="Reduce Only" />}
        </div>

        <p
          className={cn(
            "text-neutral-gray-400 capitalize text-xs font-medium",
            {
              "text-sell": status === "terminated" || status === "error",
              "text-yellow-500": status === "activated",
              "text-green-500": status === "finished",
            },
          )}
        >
          {status}
        </p>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem
          label="Total Size"
          value={formatNumber(data.sz, {
            minimumFractionDigits: 2,
            symbol: data.base,
          })}
        />
        <CardItem
          label="Executed Size"
          value={formatNumber(data.executedSz, { useFallback: true })}
        />
        <CardItem
          label="Average Price"
          value={formatNumber(data.averagePx, { useFallback: true })}
        />
        <CardItem
          label="Total Runtime"
          value={formatTotalRuntime(data.totalRuntime)}
        />
      </div>
    </div>
  );
};

export default HistoryTWAPs;
