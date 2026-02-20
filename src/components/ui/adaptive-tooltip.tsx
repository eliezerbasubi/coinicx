import React from "react";

import { useIsDesktop } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";

import DrawerSheet from "./drawer-sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type Props = {
  open?: boolean;
  title?: React.ReactNode;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hideArrow?: boolean;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  onOpenChange?: (open: boolean) => void;
};

const AdaptiveTooltip = ({ hideArrow, title, side, ...props }: Props) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Tooltip open={props.open} onOpenChange={props.onOpenChange}>
        <TooltipTrigger asChild>{props.trigger}</TooltipTrigger>
        <TooltipContent
          hideArrow={hideArrow}
          side={side}
          className={cn(
            "w-32 bg-primary-dark rounded-md border border-neutral-gray-200 shadow-md p-0",
            props.className,
          )}
        >
          {props.children}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <DrawerSheet title={title} {...props} />;
};

export default AdaptiveTooltip;
