import { TwapStatesWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import TokenImage from "@/features/trade/components/TokenImage";
import { formatTwapRuntime } from "@/features/trade/utils/twap";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { formatDateTime } from "@/utils/formatting/dates";
import {
  formatNumber,
  formatNumberWithFallback,
} from "@/utils/formatting/numbers";

type ActiveTwap = TwapStatesWsEvent["states"][number][1];

const columns: ColumnDef<ActiveTwap>[] = [
  {
    header: "Coin",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return <span className="font-medium">{original.coin}</span>;
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
      const executedSz = Number(original.executedSz);

      const avgPx = executedSz ? Number(original.executedNtl) / executedSz : 0;

      return (
        <span className="text-buy">{formatNumberWithFallback(avgPx)}</span>
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
  const twaps = useShallowUserTradeStore((s) => s.twapStates.twaps);

  const data = Array.from(new Map(twaps).values());

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={false}
      className="space-y-1.5 mb-3"
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
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.coin}
            name={data.coin}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium">{data.coin}</p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              Size: {data.coin}
              <span className="ml-2">Executed: {data.coin}</span>
            </span>
          </p>
        </div>
      </div>
      <div className="flex-1 text-right">
        <button
          type="button"
          className="text-sell text-xs font-medium bg-sell/10 rounded-md px-3 py-1"
        >
          Terminate
        </button>
      </div>
    </div>
  );
};

export default ActiveTWAPs;
