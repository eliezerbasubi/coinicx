import React from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/utils/cn";

const DrawerSheet = dynamic(() => import("./drawer-sheet"), { ssr: false });
const PopoverSheet = dynamic(() => import("./popover-sheet"), { ssr: false });

type Props = {
  open?: boolean;
  modal?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  triggerRef?: React.Ref<HTMLElement>;
  onOpenChange?: (open: boolean) => void;
} & Pick<
  React.ComponentProps<typeof PopoverSheet>,
  "collisionBoundary" | "collisionPadding" | "align" | "side" | "sideOffset"
>;

const AdaptivePopover = ({
  triggerRef,
  collisionBoundary,
  collisionPadding,
  align,
  title,
  description,
  ...props
}: Props) => {
  const isDesktop = useMediaQuery("(min-width: 786px)");

  if (!isDesktop) {
    return <DrawerSheet {...props} title={title} description={description} />;
  }

  return (
    <PopoverSheet
      {...props}
      align={align}
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
