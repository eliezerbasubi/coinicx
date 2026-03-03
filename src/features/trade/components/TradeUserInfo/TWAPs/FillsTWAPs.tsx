import Link from "next/link";
import { UserTwapSliceFillsWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import { ROUTES } from "@/constants/routes";
import TokenImage from "@/features/trade/components/TokenImage";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import CardItem from "../CardItem";

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
  const asset = parseBuilderDeployedAsset(data.fill.coin);
  const closedPnl =
    Number(data.fill.closedPnl) - Number(data.fill.fee);
  const sign = (closedPnl > 0 && "+") || "";
  const tradeValue = Number(data.fill.px) * Number(data.fill.sz);

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={asset.base}
              className="size-4"
              instrumentType="perps"
            />
            <Link
              href={`${ROUTES.trade.perps}/${data.fill.coin}`}
              className="text-sm text-neutral-gray-100 font-medium line-clamp-1"
            >
              {asset.base}
            </Link>
          </div>
          {asset.dex && <Tag value={asset.dex} />}
          <Tag
            value={data.fill.dir}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": data.fill.side === "A",
            })}
          />
          <Tag
            value={`${sign}${formatNumber(closedPnl, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${data.fill.feeToken}`}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": closedPnl < 0,
            })}
          />
        </div>
        <span className="text-[11px] md:text-sm text-neutral-gray-400 font-medium">
          {new Date(data.fill.time).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem
          label="Price"
          value={formatNumber(Number(data.fill.px), {
            minimumFractionDigits: 3,
          })}
        />
        <CardItem
          label="Size"
          value={`${formatNumber(Number(data.fill.sz), {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5,
          })} ${data.fill.coin}`}
        />
        <CardItem
          label="Trade Value"
          value={`${formatNumber(tradeValue, {
            minimumFractionDigits: 2,
          })} ${data.fill.feeToken}`}
        />
        <CardItem
          label="Fee"
          value={`${formatNumber(Number(data.fill.fee), {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${data.fill.feeToken}`}
        />
      </div>
    </div>
  );
};

export default FillsTWAPs;
