import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/utils/cn";

type TableHeaderSorterProps = {
  children: React.ReactNode;
  sorter?: string;
  id: string;
  onClick?: (value: string) => void;
};

const TableHeaderSorter = ({
  children,
  sorter,
  id,
  onClick,
}: TableHeaderSorterProps) => {
  const ascKey = id + "Asc";
  const descKey = id + "Desc";

  const onSort = () => {
    const value = sorter ? (sorter === ascKey ? descKey : ascKey) : descKey;

    onClick?.(value);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-x-1"
      onClick={onSort}
    >
      {children}
      <div className="flex flex-col items-center justify-center -space-y-1.5">
        <ChevronUp
          className={cn("size-3", { "text-primary": sorter === ascKey })}
        />
        <ChevronDown
          className={cn("size-3", { "text-primary": sorter === descKey })}
        />
      </div>
    </div>
  );
};

export default TableHeaderSorter;
