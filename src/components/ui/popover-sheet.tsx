import React from "react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  open?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  triggerRef?: React.Ref<HTMLElement>;
  className?: string;
  collisionBoundary?: Element | null;
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  onOpenChange?: (open: boolean) => void;
};

const PopoverSheet = ({
  open,
  children,
  className,
  collisionBoundary,
  collisionPadding,
  trigger,
  triggerRef,
  onOpenChange,
}: Props) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}

      {triggerRef && (
        <PopoverAnchor asChild>
          <span ref={triggerRef} />
        </PopoverAnchor>
      )}

      <PopoverContent
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
        className={className}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default PopoverSheet;
