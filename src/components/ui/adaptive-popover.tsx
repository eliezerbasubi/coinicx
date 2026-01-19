import React from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";

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

export default AdaptivePopover;
