import { useMemo } from "react";
import { OpenOrdersWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";
import CardItem from "./CardItem";

type OpenOrder = OpenOrdersWsEvent["orders"][number];

const columns: ColumnDef<OpenOrder>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.timestamp,
    cell({ row }) {
      return (
        <span className="font-medium space-x-1">
          <span>{new Date(row.original.timestamp).toLocaleDateString()}</span>
        </span>
      );
    },
  },
  {
    header: "Type",
    id: "type",
    accessorFn: (row) => row.orderType,
    cell({ row: { original } }) {
      return (
        <div className="flex items-center gap-1">
          <p>{original.orderType}</p>
        </div>
      );
    },
  },
  {
    id: "coin",
    header: "Coin",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return <span>{original.coin}</span>;
    },
  },
  {
    id: "side",
    header: "Side",
    cell({ row: { original } }) {
      return (
        <span
          className={cn("space-x-1 text-buy", {
            "text-sell": original.side === "A",
          })}
        >
          {original.side === "A" ? "Sell" : "Buy"}
        </span>
      );
    },
  },
  {
    id: "price",
    header: "Price",
    cell({ row: { original } }) {
      const price = Number(original.limitPx || original.triggerPx);

      return (
        <span>
          {formatNumber(price, {
            maximumSignificantDigits: 8,
            minimumSignificantDigits: 5,
            maximumFractionDigits: 8,
          })}
        </span>
      );
    },
  },
  {
    id: "value",
    header: "Value",
    cell({ row: { original } }) {
      const size = Number(original.sz);

      const price = Number(original.limitPx || original.triggerPx);

      return (
        <span>
          {formatNumber(price * size, {
            style: "currency",
          })}
        </span>
      );
    },
  },
  {
    id: "trigger",
    header: "Trigger",
    cell({ row: { original } }) {
      return <span>{original.triggerCondition}</span>;
    },
  },
  // {
  //   id: "tpsl",
  //   header: "TP/SL",
  //   cell({ row: { original } }) {
  //     return <span>{original.triggerPx}</span>;
  //   },
  // },
  {
    id: "cancelAll",
    header: "Cancel All",
    cell() {
      return (
        <button type="button" className="text-primary text-xs font-medium">
          Cancel All
        </button>
      );
    },
  },
];

const OpenOrders = () => {
  const openOrders = useShallowUserTradeStore((s) => s.openOrders);

  const data = useMemo(() => {
    if (!openOrders) return [];

    return openOrders;
  }, [openOrders]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={data}
      loading={false}
      className="space-y-1.5 mb-3"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      render={(entry) => <OpenOrderCard data={entry} />}
      noData="No open orders yet"
      disablePagination
    />
  );
};

type OpenOrderCardProps = {
  data: OpenOrder;
};

const OpenOrderCard = ({ data }: OpenOrderCardProps) => {
  const asset = parseBuilderDeployedAsset(data.coin);
  const isSell = data.side === "A";
  const value = Number(data.limitPx) * Number(data.sz);

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
            <span className="text-sm text-neutral-gray-100 font-medium line-clamp-1">
              {asset.base}
            </span>
          </div>
          {asset.dex && <Tag value={asset.dex} />}
          <Tag
            value={isSell ? "Sell" : "Buy"}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": isSell,
            })}
          />
          <span className="text-neutral-gray-400 text-[11px]">
            {data.orderType}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-subgrid gap-2 text-sm">
        <CardItem label="Size" value={String(data.sz)} />
        <CardItem
          label="Price"
          value={formatNumber(Number(data.limitPx), { style: "currency" })}
        />
        <CardItem
          label="Value"
          value={formatNumber(value, { style: "currency" })}
        />
        <CardItem label="Trigger" value={data.triggerPx || "--"} />
        {/* <CardItem label="TP/SL" value={data.triggerPx || "--/--"} /> */}
      </div>

      <div className="mt-2">
        <Button variant="secondary" size="sm" className="h-7" label="Cancel" />
      </div>
    </div>
  );
};

export default OpenOrders;
