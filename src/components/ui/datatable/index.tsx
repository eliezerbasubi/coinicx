"use client";

import React, { useState } from "react";
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
  TableMeta,
  TableState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { cn } from "@/utils/cn";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableRenderer } from "./DataTableRenderer";

interface DataTableProps<TData, TValue> extends Omit<
  React.ComponentProps<typeof DataTableRenderer<TData, TValue>>,
  "table"
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  manualPagination?: boolean;
  rowCount?: number;
  state?: Partial<TableState>;
  initialState?: Partial<TableState>;
  tableClassName?: string;
  globalFilterFn?: FilterFnOption<TData>;
  hidePagination?: boolean;
  meta?: TableMeta<TData>;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onRowClick?: (data: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  state,
  initialState,
  rowCount,
  className,
  manualPagination,
  globalFilterFn,
  hidePagination,
  tableClassName,
  meta,
  onPaginationChange,
  ...props
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(
    initialState?.sorting ?? [],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState?.columnFilters ?? [],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState?.columnVisibility ?? {},
  );

  const table = useReactTable({
    data,
    columns,
    rowCount,
    manualPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
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
    onColumnVisibilityChange: setColumnVisibility,

    // Tanstack table looks for the onPaginationChange key if it exists in the options to disable auto pagination
    ...(manualPagination ? { onPaginationChange } : {}),
  });

  return (
    <div className={cn("w-full space-y-3", className)}>
      <DataTableRenderer
        {...props}
        table={table}
        columns={columns}
        className={tableClassName}
      />

      {!hidePagination && <DataTablePagination table={table} />}
    </div>
  );
}
