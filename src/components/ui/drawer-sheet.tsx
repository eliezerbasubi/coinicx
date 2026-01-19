import React from "react";

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
        <DrawerHeader className="sr-only">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>

        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerSheet;
