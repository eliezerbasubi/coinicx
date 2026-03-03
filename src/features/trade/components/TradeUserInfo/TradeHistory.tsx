import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import { ROUTES } from "@/constants/routes";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";
import CardItem from "./CardItem";

interface TradeHistoryEntry {
  timestamp: number;
  symbol: string;
  base: string;
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
        <Link
          href={original.href}
          className="font-medium hover:text-primary flex items-center gap-x-1"
        >
          <p>{original.symbol}</p>

          {original.dex && <Tag value={original.dex} />}
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
      const sign = original.closedPnl > 0 && "+";

      if (original.closedPnl === 0) {
        return <span>--</span>;
      }

      return (
        <span
          className={cn("text-buy", {
            "text-sell": original.closedPnl < 0,
          })}
        >
          {sign}
          {/* {original.closedPnl} */}
          {formatNumber(original.closedPnl, {
            style: "currency",
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

  const { spotMeta } = useMetaAndAssetCtxs();

  const spotNamesToMetas = useMemo(() => {
    const map = new Map<string, { base: string; quote: string }>();

    if (!spotMeta) return map;

    for (const meta of spotMeta.universe) {
      const [baseIndex, quoteIndex] = meta.tokens;

      map.set(meta.name, {
        base: spotMeta.tokens[baseIndex].name,
        quote: spotMeta.tokens[quoteIndex].name,
      });
    }
    return map;
  }, [spotMeta]);

  const data = useMemo(() => {
    return userFills.map((fill) => {
      const spotInfo = spotNamesToMetas.get(fill.coin);

      // Perps state
      let symbol = fill.coin;
      let href = `${ROUTES.trade.perps}/${fill.coin}`;
      let dex = null;

      // Spot state
      if (spotInfo) {
        symbol = `${spotInfo.base}/${spotInfo.quote}`;
        href = `${ROUTES.trade.spot}/${symbol}`;
      } else {
        const asset = parseBuilderDeployedAsset(fill.coin);
        dex = asset.dex;
        symbol = asset.base;
      }

      return {
        timestamp: fill.time,
        coin: fill.coin,
        direction: fill.dir,
        feeToken: fill.feeToken,
        base: spotInfo?.base || fill.coin,
        side: fill.side,
        size: Number(fill.sz),
        price: formatNumber(Number(fill.px), {
          maximumSignificantDigits: 8,
          minimumSignificantDigits: 5,
          maximumFractionDigits: 8,
        }),
        closedPnl: Number(fill.closedPnl) - Number(fill.fee),
        fee: Number(fill.fee),
        tradeValue: Number(fill.sz) * Number(fill.px),
        symbol,
        dex,
        href,
      };
    });
  }, [spotNamesToMetas, userFills]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={false}
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
  const sign = (data.closedPnl > 0 && "+") || "";

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.base}
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
            value={`${sign}${formatNumber(data.closedPnl, {
              style: "currency",
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}`}
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
