import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

type Props = {
  className?: string;
  children: React.ReactNode;
  content: React.ReactNode;
  contentClassName?: string;
};

const UnderlineTooltip = ({
  children,
  className,
  content,
  contentClassName,
}: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className={cn("underline decoration-dashed cursor-help", className)}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        className={cn(
          "max-w-64 text-neutral-gray-500 font-medium",
          contentClassName,
        )}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default UnderlineTooltip;
