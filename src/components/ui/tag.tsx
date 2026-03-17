import React from "react";

import { cn } from "@/utils/cn";

type Props = {
  value: React.ReactNode;
  className?: string;
};

const Tag = ({ value, className }: Props) => {
  return (
    <div
      className={cn(
        "inline-block p-0.5 px-1 rounded bg-primary/10 text-primary text-3xs font-medium",
        className,
      )}
    >
      {value}
    </div>
  );
};

export default Tag;
