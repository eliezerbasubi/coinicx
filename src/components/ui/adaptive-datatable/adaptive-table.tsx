import {
  ColumnMeta as BaseColumnMeta,
  ColumnDef,
  flexRender,
  RowData,
  Table,
} from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  Table as TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn";

export type AdaptiveTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  table: Table<TData>;
  loading?: boolean;
  className?: string;
  tableClassName?: string;
  rowClassName?: string;
  thClassName?: string;
  rowCellClassName?: string;
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

const AdaptiveTable = <TData, TValue>({
  table,
  columns,
  className,
  tableClassName,
  rowClassName,
  thClassName,
  rowCellClassName,
  loading,
  onRowClick,
}: AdaptiveTableProps<TData, TValue>) => {
  const { rows } = table.getRowModel();

  return (
    <div
      className={cn("w-full overflow-hidden text-neutral-gray-100", className)}
    >
      <TableElement className={tableClassName}>
        <TableHeader className="border-b-0 [&_tr]:border-b-0 border-neutral-gray-200 sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap text-left text-neutral-gray-400 font-medium py-2 px-4",
                      thClassName,
                      (
                        header.column.columnDef.meta as ColumnMeta<
                          TData,
                          TValue
                        >
                      )?.thClassName,
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
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
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
                        (cell.meta as ColumnMeta<TData, TValue>)
                          ?.loaderClassName,
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </TableElement>
    </div>
  );
};

export default AdaptiveTable;
