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
import {
  formatNumber,
  formatNumberWithFallback,
} from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

type HistoricalOrder = {
  timestamp: number;
  orderType: string;
  href: string;
  base: string;
  direction: string;
  side: string;
  sz: number;
  filledSz: number;
  limitPx: number;
  triggerPx: number;
  price: number;
  reduceOnly: boolean;
  triggerCondition: string;
  status: string;
  symbol: string;
};

const orderTypeLabels: Record<string, string> = {
  "Take Profit Limit": "Limit (TP)",
  "Take Profit Market": "Market (TP)",
  "Stop Limit": "Limit (SL)",
  "Stop Market": "Market (SL)",
};

const columns: ColumnDef<HistoricalOrder>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.timestamp,
    cell({ row: { original } }) {
      return <span>{formatDateTime(original.timestamp)}</span>;
    },
  },
  {
    id: "type",
    header: "Type",
    meta: { thClassName: "w-16" },
    cell({ row: { original } }) {
      return <span>{original.orderType}</span>;
    },
  },
  {
    id: "coin",
    header: "Coin",
    meta: { thClassName: "w-16" },
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
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return <span>{formatNumberWithFallback(original.sz)}</span>;
    },
  },
  {
    id: "filledSize",
    header: "Filled Size",
    cell({ row: { original } }) {
      return <span>{formatNumberWithFallback(original.filledSz)}</span>;
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
    id: "orderValue",
    header: "Order Value",
    cell({ row: { original } }) {
      const size = original.filledSz || original.sz;
      const orderValue = size * original.price;

      return <span>{formatNumber(orderValue, { style: "currency" })}</span>;
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
    id: "triggerConditions",
    header: "Trigger",
    cell({ row: { original } }) {
      return <span>{original.triggerCondition}</span>;
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

const OrderHistory = () => {
  const { spotMeta } = useMetaAndAssetCtxs();

  const historicalOrders = useShallowUserTradeStore((s) => s.historicalOrders);

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
    return historicalOrders
      .filter((historical) => historical.status !== "open")
      .map((historicalOrder) => {
        const order = historicalOrder.order;

        const spotInfo = spotNamesToMetas.get(order.coin);

        // Perps state
        let symbol = order.coin;
        let direction = order.side === "B" ? "Long" : "Short";
        let href = `${ROUTES.trade.perps}/${order.coin}`;
        let orderType = orderTypeLabels[order.orderType] || order.orderType;

        if (order.reduceOnly) {
          // flip direction
          const side = order.side === "B" ? "Short" : "Long";
          direction = "Close " + side;
        }

        // Spot state
        if (spotInfo) {
          symbol = `${spotInfo.base}/${spotInfo.quote}`;
          direction = order.side === "B" ? "Buy" : "Sell";
          href = `${ROUTES.trade.spot}/${symbol}`;
        }

        // Liquidation state
        if (order.tif === "LiquidationMarket") {
          orderType = "Liquidation";
        }

        // Status state
        let status = historicalOrder.status.toLowerCase();

        if (status.includes("rejected") || status.includes("cancelled")) {
          status = "Cancelled";
        }

        return {
          href,
          timestamp: order.timestamp,
          orderType,
          base: spotInfo?.base || order.coin,
          direction,
          side: order.side,
          sz: Number(order.origSz) - Number(order.sz),
          filledSz: Number(order.sz),
          limitPx: Number(order.limitPx || "0"),
          triggerPx: Number(order.triggerPx || "0"),
          price: Number(order.limitPx || order.triggerPx || "0"),
          reduceOnly: order.reduceOnly,
          triggerCondition: order.triggerCondition,
          status,
          symbol,
        };
      });
  }, [spotNamesToMetas, historicalOrders]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data.sort((a, b) => b.timestamp - a.timestamp)}
      loading={false}
      className="space-y-1.5 mb-3"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry: HistoricalOrder) => <OrderHistoryCard data={entry} />}
      noData="No order history yet"
      disablePagination
    />
  );
};

const OrderHistoryCard = ({ data }: { data: HistoricalOrder }) => {
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.base}
            name={data.base}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium flex items-center">
            {data.base}
            <span
              className={cn("ml-2 text-xs", {
                "text-buy": data.side === "B",
                "text-sell": data.side === "A",
              })}
            >
              {data.side}
            </span>
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              {formatNumber(Number(data.limitPx || data.triggerPx), {
                minimumFractionDigits: 2,
                style: "currency",
              })}
              <span className="ml-2">
                {Number(data.filledSz) - Number(data.sz)} / {data.filledSz}
              </span>
            </span>
          </p>
        </div>
      </div>
      <div className="flex-1 text-right">
        <p className="text-xs font-medium capitalize">{data.status}</p>
        <p className="text-xs text-neutral-gray-400 mt-1">
          {formatDateTime(data.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default OrderHistory;
