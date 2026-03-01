import React from "react";
import { Table } from "@tanstack/react-table";

import { cn } from "@/utils/cn";

export type AdaptiveTableCardProps<TData> = {
  table: Table<TData>;
  loading?: boolean;
  className?: string;
  skeleton?: React.ReactNode;
  render?: (data: TData) => React.ReactNode;
};

const AdaptiveTableCard = <TData,>({
  table,
  loading,
  className,
  skeleton,
  render,
}: AdaptiveTableCardProps<TData>) => {
  const { rows } = table.getRowModel();

  return (
    <div className={cn("w-full", className)}>
      {rows.map((row) => (
        <React.Fragment key={row.id ?? row.index}>
          {render?.(row.original)}
        </React.Fragment>
      ))}

      {!Boolean(rows.length) && !loading && (
        <div className="h-24 text-center">No results</div>
      )}
      {!Boolean(rows.length) &&
        loading &&
        Array.from({ length: 10 }).map((_, index) => (
          <React.Fragment key={`row_${index}`}>{skeleton}</React.Fragment>
        ))}
    </div>
  );
};

export default AdaptiveTableCard;
