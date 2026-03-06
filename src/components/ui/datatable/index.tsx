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
  TableState,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/utils/cn";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableRenderer } from "./DataTableRenderer";

interface DataTableProps<TData, TValue> extends React.ComponentProps<
  typeof DataTableRenderer<TData, TValue>
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  manualPagination?: boolean;
  rowCount?: number;
  state?: Partial<TableState>;
  tableClassName?: string;
  globalFilterFn?: FilterFnOption<TData>;
  disablePagination?: boolean;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onRowClick?: (data: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  state,
  rowCount,
  className,
  manualPagination,
  globalFilterFn,
  disablePagination,
  tableClassName,
  onPaginationChange,
  ...props
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    rowCount,
    manualPagination,
    state: {
      ...state,
      sorting,
      columnFilters,
    },
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,

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

      {!disablePagination && <DataTablePagination table={table} />}
    </div>
  );
}
