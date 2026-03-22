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

import CardItem from "./CardItem";
import CoinLink from "./CoinLink";
import { useSpotToTokenDetails } from "./hooks/useSpotToTokenDetails";

interface TradeHistoryEntry {
  timestamp: number;
  symbol: string;
  base: string;
  coin: string;
  dex: string | null;
  direction: string;
  feeToken: string;
  price: string;
  size: number;
  side: string;
  tradeValue: number;
  fee: number;
  closedPnl: number;
  href: string;
}

const columns: ColumnDef<TradeHistoryEntry>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.timestamp,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "symbol",
    header: "Coin",
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
    id: "direction",
    header: "Direction",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("text-buy", {
            "text-sell": original.side === "A",
          })}
        >
          {original.direction}
        </span>
      );
    },
  },
  {
    id: "price",
    header: "Price",
    cell({ row: { original } }) {
      return <span>{original.price}</span>;
    },
  },
  {
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span className="space-x-1">
          <span>{original.size}</span>
          <span>{original.base}</span>
        </span>
      );
    },
  },
  {
    id: "tradeValue",
    header: "Trade Value",
    cell({ row: { original } }) {
      return (
        <span>{formatNumber(original.tradeValue, { style: "currency" })}</span>
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
            {formatNumber(original.fee, { maximumFractionDigits: 6 })}
          </span>
          <span>{original.feeToken}</span>
        </span>
      );
    },
  },
  {
    id: "closedPnl",
    header: "Closed PNL",
    cell({ row: { original } }) {
      if (original.closedPnl === 0) {
        return <span>--</span>;
      }

      return (
        <span
          className={cn("text-buy", {
            "text-sell": original.closedPnl < 0,
          })}
        >
          {formatNumber(original.closedPnl, {
            style: "currency",
            useSign: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
        </span>
      );
    },
  },
];

const TradeHistory = () => {
  const userFills = useShallowUserTradeStore((s) => s.fills);

  const { mapSpotNameToTokenDetails } = useSpotToTokenDetails();

  const data = useMemo(() => {
    return userFills.map((fill) => {
      const tokenDetails = mapSpotNameToTokenDetails(fill.coin);

      return {
        timestamp: fill.time,
        coin: tokenDetails.coin,
        direction: fill.dir,
        feeToken: fill.feeToken,
        base: tokenDetails.base,
        side: fill.side,
        size: Number(fill.sz),
        price: formatNumber(Number(fill.px), {
          maximumSignificantDigits: 8,
          minimumSignificantDigits: 5,
          maximumFractionDigits: 8,
        }),
        closedPnl: Number(fill.closedPnl) + Number(fill.fee),
        fee: Number(fill.fee),
        tradeValue: Number(fill.sz) * Number(fill.px),
        symbol: tokenDetails.symbol,
        dex: tokenDetails.dex,
        href: tokenDetails.href,
      };
    });
  }, [mapSpotNameToTokenDetails, userFills]);

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
      render={(entry: TradeHistoryEntry) => <TradeHistoryCard data={entry} />}
      noData="No trade history yet"
      disablePagination
    />
  );
};

const TradeHistoryCard = ({ data }: { data: TradeHistoryEntry }) => {
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
          <Tag
            value={data.direction}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": data.side === "A",
            })}
          />
          <Tag
            value={formatNumber(data.closedPnl, {
              style: "currency",
              useSign: true,
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": data.closedPnl < 0,
            })}
          />
        </div>
        <span className="text-[11px] md:text-sm text-neutral-gray-400 font-medium">
          {new Date(data.timestamp).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem label="Price" value={data.price} />
        <CardItem
          label="Size"
          value={formatNumber(data.size, {
            maximumFractionDigits: 6,
          })}
        />
        <CardItem
          label="Trade Value"
          value={formatNumber(data.tradeValue, {
            style: "currency",
          })}
        />
        <CardItem
          label="Fee"
          value={formatNumber(data.fee, {
            maximumFractionDigits: 6,
          })}
        />
      </div>
    </div>
  );
};

export default TradeHistory;
