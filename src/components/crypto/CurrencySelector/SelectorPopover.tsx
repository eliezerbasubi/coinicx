import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  open: boolean;
  trigger: React.ReactNode;
  children: React.ReactNode;
  collisionBoundary?: Element | null;
  onOpenChange?: (open: boolean) => void;
};

const SelectorPopover = ({
  open,
  trigger,
  collisionBoundary,
  children,
  onOpenChange,
}: Props) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="w-fit flex items-center shrink-0">
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        collisionPadding={0}
        sideOffset={24}
        className="w-[398px] -mr-4"
        avoidCollisions={false}
        collisionBoundary={collisionBoundary}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default SelectorPopover;
