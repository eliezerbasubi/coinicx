import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { OpenOrder } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/formatting/dates";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import AdaptiveDataTable from "@/components/ui/adaptive-datatable";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { useCancelOrder } from "@/features/trade/hooks/useCancelOrder";
import { orderTypeLabels } from "@/features/trade/utils/orderTypes";

import CardItem from "./CardItem";
import CoinLink from "./CoinLink";
import { useSpotToTokenDetails } from "./hooks/useSpotToTokenDetails";

const columns: ColumnDef<OpenOrder>[] = [
  {
    header: "Time",
    accessorFn: (row) => row.timestamp,
    cell({ row: { original } }) {
      return (
        <span className="font-medium">
          {formatDateTime(original.timestamp)}
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
      return (
        <CoinLink
          dex={original.dex}
          symbol={original.symbol}
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
          className={cn("text-buy", { "text-sell": original.side === "A" })}
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
      return <span>{original.sz}</span>;
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
    id: "value",
    header: "Value",
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.price * original.sz, {
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
  {
    id: "cancelAll",
    header({ table }) {
      const openOrders = (
        table.options.meta as unknown as { openOrders: OpenOrder[] }
      )?.openOrders;

      return (
        <CancelOrderButton
          variant="ghost"
          openOrders={openOrders}
          label="Cancel All"
          className={cn("text-primary text-xs font-medium h-fit p-0", {
            "text-neutral-gray-400": !openOrders.length,
          })}
        />
      );
    },
    cell({ row: { original } }) {
      return (
        <CancelOrderButton
          variant="ghost"
          openOrders={[original]}
          label="Cancel"
          className="text-primary text-xs font-medium h-fit p-0"
        />
      );
    },
  },
];

const OpenOrders = () => {
  const isMobile = useIsMobile();

  const { mapSpotNameToTokenDetails } = useSpotToTokenDetails();
  const openOrders = useShallowUserTradeStore((s) => s.openOrders);

  const data = useMemo<OpenOrder[]>(() => {
    if (!openOrders) return [];

    return openOrders.map((order) => {
      const tokenDetails = mapSpotNameToTokenDetails(order.coin);

      let direction = order.side === "B" ? "Long" : "Short";

      if (order.reduceOnly) {
        // flip direction
        const side = order.side === "B" ? "Short" : "Long";
        direction = "Close " + side;
      }

      // Spot state
      if (tokenDetails.isSpot) {
        direction = order.side === "B" ? "Buy" : "Sell";
      }

      const sz = Number(order.sz);
      const price = Number(order.limitPx || order.triggerPx);

      return {
        direction,
        timestamp: order.timestamp,
        triggerPx: order.triggerPx,
        href: tokenDetails.href,
        base: tokenDetails.base,
        dex: tokenDetails.dex,
        symbol: tokenDetails.symbol,
        coin: tokenDetails.coin,
        isSpot: tokenDetails.isSpot,
        side: order.side,
        sz,
        price,
        orderType: orderTypeLabels[order.orderType] || order.orderType,
        triggerCondition: order.triggerCondition,
        oid: order.oid,
        cloid: order.cloid,
      };
    });
  }, [openOrders]);

  return (
    <div className="w-full">
      <Visibility visible={isMobile && !!data.length}>
        <div className="w-full flex justify-end py-2 px-4">
          <CancelOrderButton
            variant="ghost"
            openOrders={data}
            label="Cancel All"
            className={cn("w-fit text-primary text-xs font-medium h-fit p-0", {
              "text-neutral-gray-400": !openOrders.length,
            })}
          />
        </div>
      </Visibility>
      <AdaptiveDataTable
        columns={columns}
        data={data}
        loading={false}
        meta={{
          // We're passing positions here so that we can grab them inside the header
          // Good for performance. Better than calling table.getRowModel().rows inside header
          openOrders: data,
        }}
        className="space-y-1.5 mb-3"
        wrapperClassName="px-4 md:p-0"
        thClassName="h-8 py-0 font-medium text-xs"
        rowClassName="text-xs font-medium whitespace-nowrap py-0"
        rowCellClassName="py-1"
        render={(entry) => <OpenOrderCard data={entry} />}
        noData="No open orders yet"
        disablePagination
      />
    </div>
  );
};

type OpenOrderCardProps = {
  data: OpenOrder;
};

const OpenOrderCard = ({ data }: OpenOrderCardProps) => {
  const isSell = data.side === "A";

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <div className="flex items-center gap-x-1 mr-1">
            <TokenImage
              name={data.base}
              className="size-4"
              instrumentType="perps"
            />
            <span className="text-sm text-neutral-gray-100 font-medium line-clamp-1">
              {data.base}
            </span>
          </div>
          {data.dex && <Tag value={data.dex} />}
          <Tag
            value={data.direction}
            className={cn("text-buy bg-buy/10", {
              "text-sell bg-sell/10": isSell,
            })}
          />
          <span className="text-neutral-gray-400 text-[11px] font-medium">
            {data.orderType}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 text-sm">
        <CardItem label="Size" value={String(data.sz)} />
        <CardItem
          label="Price"
          value={formatNumber(data.price, { style: "currency" })}
        />
        <CardItem
          label="Value"
          value={formatNumber(data.price * data.sz, { style: "currency" })}
        />
        <CardItem
          label="Trigger"
          value={formatNumber(Number(data.triggerPx), { useFallback: true })}
        />
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

export default OpenOrders;
