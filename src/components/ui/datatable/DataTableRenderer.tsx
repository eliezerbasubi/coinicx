import {
  ColumnMeta as BaseColumnMeta,
  ColumnDef,
  flexRender,
  RowData,
  Table,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils/cn";
import {
  TableBody,
  TableCell,
  Table as TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableRendererProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  table: Table<TData>;
  loading?: boolean;
  className?: string;
  rowClassName?: string;
  thClassName?: string;
  rowCellClassName?: string;
  headerClassName?: string;
  noData?: React.ReactNode;
  onRowClick?: (data: TData) => void;
};

interface ColumnMeta<TData extends RowData, TValue> extends BaseColumnMeta<
  TData,
  TValue
> {
  className?: string;
  thClassName?: string;
  loaderClassName?: string;
}

export const DataTableRenderer = <TData, TValue>({
  table,
  columns,
  className,
  rowClassName,
  thClassName,
  rowCellClassName,
  headerClassName,
  loading,
  noData,
  onRowClick,
}: DataTableRendererProps<TData, TValue>) => {
  const { rows } = table.getRowModel();

  return (
    <TableElement className={cn("table-auto", className)}>
      <TableHeader
        className={cn(
          "border-b-0 [&_tr]:border-b-0 border-neutral-gray-200 sticky top-0 bg-background",
          headerClassName,
        )}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    "whitespace-nowrap text-left text-neutral-gray-400 font-medium py-2 px-4",
                    thClassName,
                    (header.column.columnDef.meta as ColumnMeta<TData, TValue>)
                      ?.thClassName,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {!!rows?.length &&
          !loading &&
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={cn("text-left py-2 px-4", rowClassName)}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "text-left py-2 px-4",
                    rowCellClassName,
                    (cell.column.columnDef.meta as ColumnMeta<TData, TValue>)
                      ?.className,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}

        {!Boolean(rows.length) && !loading && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="text-center">
              {noData || "No results"}
            </TableCell>
          </TableRow>
        )}
        {!Boolean(rows.length) &&
          loading &&
          Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={`row_${index}`} className="text-left py-2 px-4">
              {columns.map((cell, i) => (
                <TableCell
                  key={`cell_${i}_${cell.id}`}
                  className={cn(
                    "text-left py-2 px-4",
                    (cell.meta as ColumnMeta<TData, TValue>)?.className,
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-2/3 rounded-2xl bg-neutral-gray-600 animate-pulse",
                      (cell.meta as ColumnMeta<TData, TValue>)?.loaderClassName,
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
      </TableBody>
    </TableElement>
  );
};
