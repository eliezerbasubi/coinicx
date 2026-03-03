import Link from "next/link";
import { UserTwapHistoryWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { ROUTES } from "@/constants/routes";
import TokenImage from "@/features/trade/components/TokenImage";
import { formatTotalRuntime } from "@/features/trade/utils/twap";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import {
  formatNumber,
  formatNumberWithFallback,
} from "@/utils/formatting/numbers";

type TwapHistory = UserTwapHistoryWsEvent["history"][number];

const columns: ColumnDef<TwapHistory>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.time,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.time * 1000)}</span>;
    },
  },
  {
    id: "coin",
    header: "Coin",
    cell({ row: { original } }) {
      const isSpot =
        original.state.coin.startsWith("@") ||
        original.state.coin.includes("USDC");

      let path = `${ROUTES.trade.perps}/${original.state.coin}`;

      // TODO complete this implementation for spot to have quote asset
      if (isSpot) {
        path = `${ROUTES.trade.spot}/${original.state.coin}/${original.state.coin}`;
      }

      return (
        <Link
          href={path}
          className="font-medium hover:text-primary transition-colors"
        >
          {original.state.coin}
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
            {formatNumber(Number(original.state.sz), {
              minimumFractionDigits: 2,
            })}
          </span>
          <span>{original.state.coin}</span>
        </span>
      );
    },
  },
  {
    id: "executedSize",
    header: "Executed Size",
    cell({ row: { original } }) {
      const executedSz = Number(original.state.executedSz);

      return (
        <span className="space-x-1 text-buy">
          <span>{formatNumberWithFallback(executedSz)}</span>
          {!!executedSz && <span>{original.state.coin}</span>}
        </span>
      );
    },
  },
  {
    id: "averagePrice",
    header: "Average Price",
    cell({ row: { original } }) {
      const avgPx = Number(original.state.executedSz)
        ? Number(original.state.executedNtl) / Number(original.state.executedSz)
        : 0;

      return <span>{formatNumberWithFallback(avgPx)}</span>;
    },
  },
  {
    id: "totalRuntime",
    header: "Total Runtime",
    cell({ row: { original } }) {
      return <span>{formatTotalRuntime(original.state.minutes)}</span>;
    },
  },
  {
    id: "reduceOnly",
    header: "Reduce Only",
    cell({ row: { original } }) {
      return <span>{original.state.reduceOnly ? "Yes" : "No"}</span>;
    },
  },
  {
    id: "randomize",
    header: "Randomize",
    cell({ row: { original } }) {
      return <span>{original.state.randomize ? "Yes" : "No"}</span>;
    },
  },
  {
    id: "status",
    header: "Status",
    cell({ row: { original } }) {
      return (
        <span className="font-medium capitalize">{original.status.status}</span>
      );
    },
  },
];

const HistoryTWAPs = () => {
  const history = useShallowUserTradeStore((s) => s.twapStates.history);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={history.sort((a, b) => b.time - a.time)}
      loading={false}
      className="space-y-1.5 mb-3"
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
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.state.coin}
            name={data.state.coin}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium">{data.state.coin}</p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              {formatNumber(0, {
                minimumFractionDigits: 2,
                style: "currency",
              })}
              <span className="ml-2">
                {data.state.executedSz} / {data.state.sz}
              </span>
            </span>
          </p>
        </div>
      </div>
      <div className="flex-1 text-right">
        <span
          className={cn("font-medium text-green-500 capitalize", {
            "text-red-500": data.status.status === "terminated",
            "text-yellow-500": data.status.status === "activated",
          })}
        >
          {data.status.status}
        </span>
      </div>
    </div>
  );
};

export default HistoryTWAPs;
