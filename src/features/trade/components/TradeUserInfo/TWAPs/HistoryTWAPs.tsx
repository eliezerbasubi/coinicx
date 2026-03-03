import Link from "next/link";
import { UserTwapHistoryWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
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

import CardItem from "../CardItem";

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
  const executedSz = Number(data.state.executedSz);
  const avgPx = executedSz ? Number(data.state.executedNtl) / executedSz : 0;
  const status = data.status.status;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.state.coin}
              className="size-4"
              instrumentType="perps"
            />
            <Link
              href={`${ROUTES.trade.perps}/${data.state.coin}`}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {data.state.coin}
            </Link>
          </div>
          {data.state.randomize && <Tag value="Randomize" />}
          {data.state.reduceOnly && <Tag value="Reduce Only" />}
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
          value={`${formatNumber(Number(data.state.sz), {
            minimumFractionDigits: 2,
          })} ${data.state.coin}`}
        />
        <CardItem
          label="Executed Size"
          value={formatNumberWithFallback(executedSz)}
        />
        <CardItem
          label="Average Price"
          value={formatNumberWithFallback(avgPx)}
        />
        <CardItem
          label="Total Runtime"
          value={formatTotalRuntime(data.state.minutes)}
        />
      </div>
    </div>
  );
};

export default HistoryTWAPs;
