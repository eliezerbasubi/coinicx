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

import type { AdaptiveTableProps } from "./adaptive-table";
import type { AdaptiveTableCardProps } from "./adaptive-table-card";

const AdaptiveTable = dynamic(() => import("./adaptive-table"), { ssr: false });
const AdaptiveTableCard = dynamic(() => import("./adaptive-table-card"), {
  ssr: false,
});
const AdaptivePagination = dynamic(() => import("./adaptive-pagination"), {
  ssr: false,
});

type CompProps<TData, TValue> = AdaptiveTableProps<TData, TValue> &
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
  disablePagination?: boolean;
  meta?: TableMeta<TData>;
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
  disablePagination,
  meta,
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
      ...state,
      sorting,
      columnFilters,
    },
    globalFilterFn,
    meta,
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
      {!isDesktop ? (
        <AdaptiveTableCard
          table={table as Table<unknown>}
          className={props.className}
          loading={props.loading}
          skeleton={skeleton}
          render={render as (data: unknown) => React.ReactNode}
        />
      ) : (
        <AdaptiveTable
          {...props}
          disablePagination={disablePagination}
          columns={columns as ColumnDef<unknown, unknown>[]}
          table={table as Table<unknown>}
          onRowClick={onRowClick as (data: unknown) => void}
        />
      )}

      {!disablePagination && (
        <AdaptivePagination table={table as Table<unknown>} />
      )}
    </div>
  );
};

export default AdaptiveDataTable;
