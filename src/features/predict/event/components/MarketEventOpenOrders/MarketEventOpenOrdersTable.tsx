import { useMemo } from "react";
import { FrontendOpenOrdersResponse } from "@nktkas/hyperliquid";
import { ColumnDef } from "@tanstack/react-table";

import { InstrumentType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { useShallowUserPredictionStore } from "@/features/predict/lib/store/user-prediction";
import { MarketEventMetaOutcome } from "@/features/predict/lib/types";
import { parseSideCoinFromCoin } from "@/features/predict/lib/utils/outcomes";
import { useCancelOrder } from "@/features/trade/hooks/useCancelOrder";

type Props = {
  outcomeMeta: MarketEventMetaOutcome;
  className?: string;
};

type OpenOrder = {
  oid: number;
  side: FrontendOpenOrdersResponse[number]["side"];
  coin: string;
  limitPx: string;
  sideIndex: number;
  sideName: string;
  size: string;
  triggerCondition: string;
  type: InstrumentType;
};

const columns: ColumnDef<OpenOrder>[] = [
  {
    id: "side",
    header: "Side",
    accessorFn: (row) => row.side,
    cell({ row: { original } }) {
      return <span>{original.side === "B" ? "Buy" : "Sell"}</span>;
    },
  },
  {
    id: "outcome",
    header: "OUTCOME",
    accessorFn: (row) => row.coin,
    cell({ row: { original } }) {
      return (
        <Tag
          className={cn("bg-buy/10 text-buy space-x-1", {
            "bg-sell/10 text-sell": original.sideIndex === 1,
          })}
        >
          {original.sideName}
        </Tag>
      );
    },
  },
  {
    id: "price",
    header: "PRICE",
    accessorFn: (row) => row.limitPx,
    cell({ row: { original } }) {
      return (
        <span>{formatNumber(Number(original.limitPx), { style: "cent" })}</span>
      );
    },
  },
  {
    id: "total",
    header: "TOTAL",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.size) * Number(original.limitPx), {
            style: "currency",
          })}
        </span>
      );
    },
  },
  {
    id: "condition",
    header: "TRIGGER CONDITION",
    accessorFn: (row) => row.triggerCondition,
    cell({ row: { original } }) {
      return <span>{original.triggerCondition}</span>;
    },
  },
  {
    id: "actions",
    cell({ table }) {
      const { openOrders } = table.options.meta as unknown as {
        openOrders: OpenOrder[];
      };

      return (
        <CancelOrderButton
          variant="secondary"
          size="sm"
          className="hover:text-white text-sm"
          label="Cancel"
          openOrders={openOrders}
        />
      );
    },
  },
];

const MarketEventOpenOrdersTable = ({ outcomeMeta, className }: Props) => {
  const openOrders = useShallowUserPredictionStore((s) => s.openOrders);

  const marketOpenOrders = useMemo(() => {
    const orders = openOrders.get(outcomeMeta.outcome);

    if (!orders) return [];

    const mappedOrders: OpenOrder[] = [];

    for (const order of orders) {
      const parsedData = parseSideCoinFromCoin(order.coin);
      if (!parsedData) continue;

      const side = outcomeMeta.sides[parsedData.sideIndex];

      mappedOrders.push({
        side: order.side,
        coin: order.coin,
        limitPx: order.limitPx,
        size: order.sz,
        sideIndex: parsedData.sideIndex,
        sideName: side.name,
        oid: order.oid,
        triggerCondition: order.triggerCondition,
        type: "prediction",
      });
    }

    return mappedOrders;
  }, [openOrders, outcomeMeta.outcome]);

  return (
    <AdaptiveDataTable
      columns={columns}
      data={marketOpenOrders}
      meta={{
        openOrders: marketOpenOrders,
      }}
      className={cn("space-y-1 md:space-y-1.5 mb-3", className)}
      wrapperClassName="px-2 md:p-0"
      thClassName="h-8 py-0 font-medium text-xs"
      rowClassName="text-xs font-medium whitespace-nowrap py-0"
      rowCellClassName="py-1"
      noData="No orders found"
      render={(entry) => <MarketEventOpenOrderCard data={entry} />}
    />
  );
};

type MarketEventOpenOrderCardProps = {
  data: OpenOrder;
};

const MarketEventOpenOrderCard = ({ data }: MarketEventOpenOrderCardProps) => {
  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <p className="text-sm text-neutral-gray-100 font-medium">
            {data.side === "B" ? "Buy" : "Sell"}
          </p>

          <Tag
            className={cn("text-buy bg-buy/10 space-x-1", {
              "text-sell bg-sell/10": data.sideIndex === 1,
            })}
          >
            <span>{data.sideName}</span>
            <span>{formatNumber(Number(data.limitPx), { style: "cent" })}</span>
          </Tag>
        </div>

        <div className="text-right">
          <p className="text-sm text-white font-medium">
            {formatNumber(Number(data.size) * Number(data.limitPx))}
          </p>
        </div>
      </div>

      <CancelOrderButton
        showLoading
        openOrders={[data]}
        variant="secondary"
        size="sm"
        className="h-7 mt-2 text-xs text-white"
        label="Cancel"
      />
    </div>
  );
};

type CancelOrderButtonProps = React.ComponentProps<typeof Button> & {
  openOrders: OpenOrder[];
  showLoading?: boolean;
};

const CancelOrderButton = ({
  openOrders,
  showLoading,
  ...props
}: CancelOrderButtonProps) => {
  const { processing, cancelOrder } = useCancelOrder();

  return (
    <Button
      {...props}
      loading={showLoading && processing}
      disabled={processing}
      onClick={() => cancelOrder(openOrders)}
    />
  );
};

export default MarketEventOpenOrdersTable;
