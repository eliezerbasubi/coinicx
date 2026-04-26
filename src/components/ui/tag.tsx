import React from "react";

import { cn } from "@/lib/utils/cn";

type Props = {
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const Tag = ({
  value,
  children,
  className,
  ...props
}: Props & React.ComponentProps<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        "inline-block p-0.5 px-1 rounded bg-primary/10 text-primary text-3xs font-medium",
        className,
      )}
    >
      {children ?? value}
    </div>
  );
};

export default Tag;
