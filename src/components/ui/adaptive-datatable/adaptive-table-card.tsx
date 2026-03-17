import React from "react";
import { Table } from "@tanstack/react-table";

import { cn } from "@/utils/cn";

export type AdaptiveTableCardProps<TData> = {
  table: Table<TData>;
  loading?: boolean;
  className?: string;
  skeleton?: React.ReactNode;
  disablePagination?: boolean;
  render?: (data: TData) => React.ReactNode;
};

export const AdaptiveTableCard = <TData,>({
  table,
  loading,
  className,
  skeleton,
  disablePagination,
  render,
}: AdaptiveTableCardProps<TData>) => {
  const { rows } = disablePagination
    ? table.getCoreRowModel()
    : table.getRowModel();

  return (
    <div className={cn("size-full", className)}>
      {rows.map((row) => (
        <React.Fragment key={row.id ?? row.index}>
          {render?.(row.original)}
        </React.Fragment>
      ))}

      {!Boolean(rows.length) && !loading && (
        <div className="h-24 flex items-center justify-center">No results</div>
      )}
      {!Boolean(rows.length) &&
        loading &&
        Array.from({ length: 10 }).map((_, index) => (
          <React.Fragment key={`row_${index}`}>{skeleton}</React.Fragment>
        ))}
    </div>
  );
};
