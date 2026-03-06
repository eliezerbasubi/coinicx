import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import Tag from "@/components/ui/tag";
import { orderTypeLabels } from "@/features/trade/utils/orderTypes";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatting/dates";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";
import CardItem from "./CardItem";
import CoinLink from "./CoinLink";
import { useSpotToTokenDetails } from "./hooks/useSpotToTokenDetails";

type HistoricalOrder = {
  timestamp: number;
  orderType: string;
  href: string;
  dex: string | null;
  base: string;
  coin: string;
  direction: string;
  side: string;
  sz: number;
  filledSz: number;
  orderValue: number;
  price: number;
  reduceOnly: boolean;
  triggerCondition: string;
  status: string;
  symbol: string;
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
    id: "size",
    header: "Size",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.sz, {
            useFallback: true,
            maximumFractionDigits: 5,
          })}
        </span>
      );
    },
  },
  {
    id: "filledSize",
    header: "Filled Size",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.filledSz, {
            useFallback: true,
            maximumFractionDigits: 5,
          })}
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
    id: "orderValue",
    header: "Order Value",
    cell({ row: { original } }) {
      return (
        <span>{formatNumber(original.orderValue, { style: "currency" })}</span>
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
  const { mapSpotNameToTokenDetails } = useSpotToTokenDetails();

  const historicalOrders = useShallowUserTradeStore((s) => s.historicalOrders);

  const data = useMemo(() => {
    return historicalOrders
      .filter((historical) => historical.status !== "open")
      .map((historicalOrder) => {
        const order = historicalOrder.order;

        const tokenDetails = mapSpotNameToTokenDetails(order.coin);

        // Perps state
        let direction = order.side === "B" ? "Long" : "Short";
        let orderType = orderTypeLabels[order.orderType] || order.orderType;

        if (order.reduceOnly) {
          // flip direction
          const side = order.side === "B" ? "Short" : "Long";
          direction = "Close " + side;
        }

        // Spot state
        if (tokenDetails.isSpot) {
          direction = order.side === "B" ? "Buy" : "Sell";
        }

        // Liquidation state
        if (order.tif === "LiquidationMarket") {
          orderType = "Liquidation";
        }

        // Status state
        let status = historicalOrder.status.toLowerCase();

        if (status.includes("rejected") || status.includes("canceled")) {
          status = "Canceled";
        }

        const size = Number(order.origSz) - Number(order.sz);
        const filledSize = Number(order.sz);
        const price = Number(order.limitPx || order.triggerPx || "0");

        return {
          ...tokenDetails,
          timestamp: order.timestamp,
          orderType,
          direction,
          side: order.side,
          sz: size,
          filledSz: filledSize,
          orderValue: Number(filledSize || size) * price,
          price,
          reduceOnly: order.reduceOnly,
          triggerCondition: order.triggerCondition,
          status,
        };
      });
  }, [mapSpotNameToTokenDetails, historicalOrders]);

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
      render={(entry: HistoricalOrder) => <OrderHistoryCard data={entry} />}
      noData="No order history yet"
      disablePagination
    />
  );
};

const OrderHistoryCard = ({ data }: { data: HistoricalOrder }) => {
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
            value={data.status}
            className="text-neutral-gray-400 bg-neutral-gray-200 capitalize font-medium"
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

      <div className="w-full grid grid-cols-5 gap-2 text-sm">
        <CardItem label="Type" value={data.orderType} />
        <CardItem
          label="Size"
          value={formatNumber(data.sz, { useFallback: true })}
        />
        <CardItem
          label="Filled Size"
          value={formatNumber(data.filledSz, { useFallback: true })}
        />
        <CardItem
          label="Price"
          value={formatNumber(data.price, {
            useFallback: true,
            maximumSignificantDigits: 8,
            minimumSignificantDigits: 5,
            maximumFractionDigits: 8,
          })}
        />
        <CardItem
          label="Order Value"
          value={formatNumber(data.orderValue, {
            useFallback: true,
            maximumFractionDigits: 6,
          })}
        />
      </div>
    </div>
  );
};

export default OrderHistory;
