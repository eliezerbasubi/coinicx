import { ColumnDef } from "@tanstack/react-table";

import { Asset } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import { DataTableColumnHeader } from "@/components/ui/datatable/ColumnHeader";
import { formatPriceToDecimal, getPriceDecimals } from "@/features/trade/utils";

import AssetSymbolTile from "./AssetSymbolTile";

type TableMeta = {
  isMobile: boolean;
  toggleFavourite: (symbol: string) => void;
};

export const ASSETS_SELECTOR_COLUMNS: ColumnDef<Asset>[] = [
  {
    id: "symbol",
    accessorFn: (row) => row.symbol,
    header: ({ column, table }) => {
      const isMobile = (table.options.meta as TableMeta).isMobile;

      return (
        <div className="flex items-center space-x-1">
          <DataTableColumnHeader
            column={column}
            title="Symbol"
            className="text-xs"
          />
          <Visibility visible={isMobile}>
            <DataTableColumnHeader
              column={table.getColumn("volume")!}
              className="text-xs"
            >
              <span>/</span>
              <p>Vol</p>
            </DataTableColumnHeader>
          </Visibility>
        </div>
      );
    },
    cell({ row: { original } }) {
      return <AssetSymbolTile asset={original} />;
    },
  },
  {
    id: "lastPrice",
    accessorKey: "midPx",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Price"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      const pxDecimals = getPriceDecimals(
        original.midPx,
        original.szDecimals,
        original.isSpot,
      );
      return <span>{formatPriceToDecimal(original.midPx, pxDecimals)}</span>;
    },
  },
  {
    id: "change",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="24h Change"
        className="text-xs"
      />
    ),
    accessorFn: (row) => row.markPx - row.prevDayPx,
    cell({ row: { original } }) {
      const hasPricing = original.prevDayPx && original.markPx;
      const change = hasPricing ? original.markPx - original.prevDayPx : 0;
      const changeInPercentage = change
        ? (change / original.prevDayPx) * 100
        : 0;
      const pxDecimals = getPriceDecimals(
        original.midPx,
        original.szDecimals,
        original.isSpot,
      );

      return (
        <p
          className={cn("text-buy space-x-1", {
            "text-sell": change < 0,
            "text-neutral-gray-300": !hasPricing,
          })}
        >
          <span>
            {formatPriceToDecimal(change, pxDecimals, {
              useSign: true,
            })}
          </span>
          <span>/</span>
          <span>
            {formatNumber(changeInPercentage / 100, {
              style: "percent",
              useFallback: true,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      );
    },
  },
  {
    id: "funding",
    accessorKey: "funding",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="8h Funding"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(Number(original.funding ?? 0) / 100, {
            style: "percent",
            useFallback: true,
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
        </span>
      );
    },
  },
  {
    id: "volume",
    accessorKey: "dayNtlVlm",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Volume"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.dayNtlVlm, {
            style: "currency",
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },
  {
    id: "openInterest",
    accessorKey: "openInterest",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Open Interest"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.openInterest ?? 0, {
            style: "currency",
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },
  {
    id: "marketCap",
    accessorKey: "marketCap",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Market Cap"
        className="text-xs"
      />
    ),
    cell({ row: { original } }) {
      return (
        <span>
          {formatNumber(original.marketCap ?? 0, {
            style: "currency",
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },
  {
    id: "priceMobileOnly",
    meta: {
      className: "text-right pr-0",
      thClassName: "pr-0",
    },
    header: ({ table }) => (
      <div className="flex items-center justify-end space-x-1">
        <DataTableColumnHeader
          column={table.getColumn("lastPrice")!}
          className="text-xs"
          title="Price"
        />
        <span>/</span>
        <DataTableColumnHeader
          column={table.getColumn("change")!}
          className="text-xs"
          title="24h Change"
        />
      </div>
    ),
    cell({ row: { original } }) {
      const pxDecimals = getPriceDecimals(
        original.midPx,
        original.szDecimals,
        original.isSpot,
      );
      const hasPricing = original.prevDayPx && original.markPx;
      const change = hasPricing ? original.markPx - original.prevDayPx : 0;
      const changeInPercentage = change
        ? (change / original.prevDayPx) * 100
        : 0;

      return (
        <span>
          <p className="text-white font-semibold">
            {formatPriceToDecimal(original.midPx, pxDecimals)}
          </p>
          <p
            className={cn("text-buy space-x-1 text-3xs", {
              "text-sell": changeInPercentage < 0,
              "text-neutral-gray-300": !hasPricing,
            })}
          >
            <span>
              {formatPriceToDecimal(change, pxDecimals, {
                useSign: true,
              })}
            </span>
            <span>/</span>
            <span>
              {formatNumber(changeInPercentage / 100, {
                style: "percent",
                useFallback: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </span>
      );
    },
  },
];
