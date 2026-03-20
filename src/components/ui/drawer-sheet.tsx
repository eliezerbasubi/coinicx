import React from "react";

import { cn } from "@/lib/utils/cn";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;

type Props = {
  open?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
};

const DrawerSheet = ({
  open,
  className,
  trigger,
  children,
  title,
  description,
  onOpenChange,
  onPointerDownOutside,
  onOpenAutoFocus,
}: Props) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        className={className}
        onPointerDownOutside={onPointerDownOutside}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        <DrawerHeader className={cn({ "sr-only": !title && !description })}>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerSheet;
