import Link from "next/link";
import { UserTwapSliceFillsWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { ROUTES } from "@/constants/routes";
import TokenImage from "@/features/trade/components/TokenImage";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

type TwapHistoryFills = UserTwapSliceFillsWsEvent["twapSliceFills"][number];

const columns: ColumnDef<TwapHistoryFills>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.fill.time,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.fill.time)}</span>;
    },
  },
  {
    id: "coin",
    header: "Coin",
    cell({ row: { original } }) {
      return (
        <Link
          href={`${ROUTES.trade.perps}/${original.fill.coin}`}
          className="font-semibold hover:text-primary"
        >
          {original.fill.coin}
        </Link>
      );
    },
  },
  {
    id: "direction",
    header: "Direction",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("text-buy", {
            "text-sell": original.fill.side === "A",
          })}
        >
          {original.fill.dir}
        </span>
      );
    },
  },
  {
    id: "price",
    header: "Price",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.fill.px), {
            minimumFractionDigits: 3,
          })}
        </span>
      );
    },
  },
  {
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(Number(original.fill.sz), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 5,
            })}
          </span>
          <span>{original.fill.coin}</span>
        </span>
      );
    },
  },
  {
    id: "tradeValue",
    header: "Trade Value",
    cell({ row: { original } }) {
      const tradeValue = Number(original.fill.px) * Number(original.fill.sz);
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(tradeValue, {
              minimumFractionDigits: 2,
            })}
          </span>
          <span>{original.fill.feeToken}</span>
        </span>
      );
    },
  },
  {
    id: "fee",
    header: "Fee",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>
            {formatNumber(Number(original.fill.fee), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>{original.fill.feeToken}</span>
        </span>
      );
    },
  },
  {
    id: "closedPnl",
    header: "Closed PNL",
    cell({ row: { original } }) {
      // Closed Pnl includes fees and rebates, so we subtract the fee to get the actual PnL
      const closedPnl =
        Number(original.fill.closedPnl) - Number(original.fill.fee);

      return (
        <span className="space-x-1">
          <span>
            {formatNumber(closedPnl, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span>{original.fill.feeToken}</span>
        </span>
      );
    },
  },
];

const FillsTWAPs = () => {
  const twapSliceFills = useShallowUserTradeStore(
    (s) => s.twapStates.sliceFills,
  );

  return (
    <AdaptiveDataTable
      columns={columns}
      data={twapSliceFills.sort((a, b) => b.fill.time - a.fill.time)}
      loading={false}
      className="space-y-1.5 mb-3"
      // wrapperClassName="h-85"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry: TwapHistoryFills) => <FillTWAPHistoryCard data={entry} />}
      noData="No TWAP history yet"
      disablePagination
    />
  );
};

const FillTWAPHistoryCard = ({ data }: { data: TwapHistoryFills }) => {
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.fill.coin}
            name={data.fill.coin}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium">{data.fill.coin}</p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              {formatNumber(Number(data.fill.fee), {
                minimumFractionDigits: 2,
                style: "currency",
              })}
              <span className="ml-2">
                {data.fill.sz} / {data.fill.crossed}
              </span>
            </span>
          </p>
        </div>
      </div>
      <div className="flex-1 text-right">
        <span
          className={cn("text-xs font-medium text-buy", {
            "text-sell": Number(data.fill.closedPnl) < 0,
          })}
        >
          {formatNumber(Number(data.fill.closedPnl))} {data.fill.feeToken}
        </span>
      </div>
    </div>
  );
};

export default FillsTWAPs;
