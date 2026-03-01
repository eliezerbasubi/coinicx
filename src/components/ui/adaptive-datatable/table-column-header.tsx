import { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDown } from "lucide-react";

import { cn } from "@/utils/cn";

import { Button } from "../button";

interface TableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const TableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: TableColumnHeaderProps<TData, TValue>) => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="default"
        size="sm"
        className="flex items-center h-auto w-auto p-0 text-sm font-medium text-neutral-gray-800 hover:text-neutral-gray-800 bg-transparent hover:bg-transparent data-[state=open]:bg-accent"
        onClick={() => {
          column.toggleSorting();
        }}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default TableColumnHeader;
