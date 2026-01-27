import React from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/utils/cn";

type Props = {
  open?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  triggerRef?: React.Ref<HTMLElement>;
  collisionBoundary?: Element | null;
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  onOpenChange?: (open: boolean) => void;
};

const DrawerSheet = dynamic(() => import("./drawer-sheet"), { ssr: false });
const PopoverSheet = dynamic(() => import("./popover-sheet"), { ssr: false });

const AdaptivePopover = ({
  triggerRef,
  collisionBoundary,
  collisionPadding,
  ...props
}: Props) => {
  const isMobile = useMediaQuery("(max-width: 786px)");

  if (isMobile) {
    return <DrawerSheet {...props} />;
  }

  return (
    <PopoverSheet
      {...props}
      triggerRef={triggerRef}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
    />
  );
};

type AdaptivePopoverTriggerProps = {
  open?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<"div">;

export const AdaptivePopoverTrigger = ({
  className,
  children,
  open,
  ...props
}: AdaptivePopoverTriggerProps) => {
  return (
    <div
      {...props}
      data-slot="popover-trigger"
      data-state={open ? "open" : "closed"}
      className={cn("group/selector flex items-center space-x-1", className)}
    >
      {children}

      <ChevronDown className="text-white transition-transform group-data-[state=open]/selector:rotate-180" />
    </div>
  );
};

export default AdaptivePopover;
