import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

const TooltipTitleWrapper = ({
  children,
  className,
}: React.PropsWithChildren<Props>) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-fit flex gap-2 p-1 border border-transparent hover:border-neutral-gray-200 rounded">
      <div
        role="button"
        className="size-4 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRight
          className={cn(
            "size-4 text-neutral-gray-400 font-semibold will-change-transform transition-transform rotate-0",
            { "rotate-90": collapsed },
          )}
          strokeWidth={3}
        />
      </div>

      <div
        className={cn(
          "inline-flex flex-wrap gap-2 text-xs lining-nums tabular-nums",
          className,
          { hidden: collapsed },
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default TooltipTitleWrapper;
