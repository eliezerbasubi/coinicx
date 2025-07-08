import React from "react";

import { cn } from "@/utils/cn";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export const Skeleton = ({ className, children }: Props) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 rounded-sm h-5 w-full",
        className,
      )}
    >
      {children}
    </div>
  );
};
