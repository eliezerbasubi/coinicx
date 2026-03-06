import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFnOption,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
  TableMeta,
  TableState,
  useReactTable,
} from "@tanstack/react-table";

import { useIsDesktop } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";

import type { DataTableRendererProps } from "../datatable/DataTableRenderer";
import type { AdaptiveTableCardProps } from "./adaptive-table-card";

const DataTableRenderer = dynamic(
  () =>
    import("../datatable/DataTableRenderer").then(
      (mod) => mod.DataTableRenderer,
    ),
  { ssr: false },
);
const AdaptiveTableCard = dynamic(
  () => import("./adaptive-table-card").then((mod) => mod.AdaptiveTableCard),
  {
    ssr: false,
  },
);
const DataTablePagination = dynamic(
  () =>
    import("../datatable/DataTablePagination").then(
      (mod) => mod.DataTablePagination,
    ),
  {
    ssr: false,
  },
);

type CompProps<TData, TValue> = DataTableRendererProps<TData, TValue> &
  AdaptiveTableCardProps<TData>;

type Props<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  manualPagination?: boolean;
  rowCount?: number;
  state?: Partial<TableState>;
  initialState?: Partial<TableState>;
  className?: string;
  wrapperClassName?: string;
  globalFilterFn?: FilterFnOption<TData>;
  meta?: TableMeta<TData>;
  hidePagination?: boolean;
  onPaginationChange?: OnChangeFn<PaginationState>;
} & Omit<CompProps<TData, TValue>, "table">;

const AdaptiveDataTable = <TData, TValue>({
  columns,
  data,
  state,
  initialState,
  rowCount,
  manualPagination,
  globalFilterFn,
  skeleton,
  wrapperClassName,
  meta,
  hidePagination,
  render,
  onPaginationChange,
  onRowClick,
  ...props
}: Props<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const isDesktop = useIsDesktop();

  const table = useReactTable({
    data,
    columns,
    rowCount,
    manualPagination,
    initialState,
    state: {
      sorting,
      columnFilters,
      ...state,
    },
    globalFilterFn,
    meta,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,

    // Add onPaginationChange if provided (for URL persistence)
    ...(onPaginationChange ? { onPaginationChange } : {}),
  });

  return (
    <div className={cn("size-full", wrapperClassName)}>
      {isDesktop ? (
        <DataTableRenderer
          {...props}
          columns={columns as ColumnDef<unknown, unknown>[]}
          table={table as Table<unknown>}
          onRowClick={onRowClick as (data: unknown) => void}
        />
      ) : (
        <AdaptiveTableCard
          table={table as Table<unknown>}
          className={props.className}
          loading={props.loading}
          skeleton={skeleton}
          render={render as (data: unknown) => React.ReactNode}
        />
      )}

      {!hidePagination && (
        <DataTablePagination
          table={table as Table<unknown>}
          hideRowsPerPage={!isDesktop}
        />
      )}
    </div>
  );
};

export default AdaptiveDataTable;
