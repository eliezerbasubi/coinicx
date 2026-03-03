import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { ROUTES } from "@/constants/routes";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

interface TradeHistoryEntry {
  timestamp: number;
  symbol: string;
  base: string;
  direction: string;
  feeToken: string;
  price: number;
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
      const asset = parseBuilderDeployedAsset(original.base);
      return (
        <Link
          href={original.href}
          className="font-medium hover:text-primary flex items-center gap-x-1"
        >
          <p>{asset.dex ? asset.base : original.symbol}</p>

          {asset.dex && (
            <div className="inline-block p-0.5 px-1 rounded bg-primary/10 text-primary text-[11px] font-medium">
              {asset.dex}
            </div>
          )}
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
      return (
        <span>
          {formatNumber(original.price, {
            maximumSignificantDigits: 8,
            minimumSignificantDigits: 5,
            maximumFractionDigits: 8,
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

      // Spot state
      if (spotInfo) {
        symbol = `${spotInfo.base}/${spotInfo.quote}`;
        href = `${ROUTES.trade.spot}/${symbol}`;
      }

      return {
        timestamp: fill.time,
        coin: fill.coin,
        direction: fill.dir,
        feeToken: fill.feeToken,
        base: spotInfo?.base || fill.coin,
        side: fill.side,
        size: Number(fill.sz),
        price: Number(fill.px),
        closedPnl: Number(fill.closedPnl) - Number(fill.fee),
        fee: Number(fill.fee),
        tradeValue: Number(fill.sz) * Number(fill.px),
        symbol,
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
  const sign = data.closedPnl > 0 && "+";

  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.symbol}
            name={data.symbol}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium flex items-center">
            {data.symbol}
            <span
              className={cn("ml-2 text-xs", {
                "text-buy": data.side === "B",
                "text-sell": data.side === "A",
              })}
            >
              {data.direction}
            </span>
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            {formatNumber(data.price, {
              minimumFractionDigits: 2,
              style: "currency",
            })}
            <span className="ml-2">Qty: {data.size}</span>
          </p>
        </div>
      </div>
      <div className="flex-1 text-right">
        {data.closedPnl !== 0 ? (
          <p
            className={cn("text-xs font-medium text-buy", {
              "text-sell": data.closedPnl < 0,
            })}
          >
            {sign}
            {formatNumber(data.closedPnl, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        ) : (
          <p className="text-xs font-medium">--</p>
        )}
        <p className="text-xs text-neutral-gray-400 mt-1">
          {formatDateTime(data.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default TradeHistory;
