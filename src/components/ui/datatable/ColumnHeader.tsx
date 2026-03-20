import React from "react";
import { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import { Button } from "../button";

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>;
    title?: React.ReactNode;
    children?: React.ReactNode;
  };

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  children,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sortDirection = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-x-1 size-auto p-0 text-sm font-medium",
        className,
      )}
      onClick={() => {
        column.toggleSorting();
      }}
    >
      {children || <span>{title}</span>}
      <div className="flex flex-col items-center justify-center -space-y-1.5">
        <ChevronUp
          className={cn("size-3", {
            "text-primary": sortDirection === "asc",
          })}
        />
        <ChevronDown
          className={cn("size-3", {
            "text-primary": sortDirection === "desc",
          })}
        />
      </div>
    </Button>
  );
}
