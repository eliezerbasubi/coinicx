import { useMemo } from "react";
import { OpenOrdersWsEvent } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import { AssetPosition } from "@/types/trade";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

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
      return (
        <span>
          {formatNumber(Number(original.limitPx), { style: "currency" })}
        </span>
      );
    },
  },
  {
    id: "value",
    header: "Value",
    cell({ row: { original } }) {
      return <span>{0.495}</span>;
    },
  },
  {
    id: "trigger",
    header: "Trigger",
    cell({ row: { original } }) {
      return <span>{original.triggerPx}</span>;
    },
  },
  {
    id: "tpsl",
    header: "TP/SL",
    cell({ row: { original } }) {
      return <span>{original.triggerPx}</span>;
    },
  },
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
  return (
    <div className="flex gap-2 items-center py-1 px-4 last:pb-0">
      <div className="flex-1 flex items-center gap-4">
        <div className="size-9 relative">
          <TokenImage
            key={data.coin}
            name={data.coin}
            instrumentType="perps"
            className="size-9 rounded-full overflow-hidden"
          />
        </div>
        <div className="flex-1 text-sm">
          <p className="text-white font-medium flex items-center">
            {data.coin}
          </p>
          <p className="text-xs text-neutral-gray-400 font-medium mt-1">
            <span>
              {formatNumber(Number(data.limitPx), {
                minimumFractionDigits: 2,
                roundingMode: "trunc",
              })}
              <span className="ml-1">
                <span className="mr-1">≈</span>
                {formatNumber(Number(data.sz), {
                  minimumFractionDigits: 2,
                  style: "currency",
                })}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="flex-1 text-right">
        <Button
          variant="secondary"
          size="sm"
          className="h-6 w-fit font-medium text-xs md:text-[13px] rounded-md px-3"
          label="Transfer"
        />
      </div>
    </div>
  );
};

export default OpenOrders;
