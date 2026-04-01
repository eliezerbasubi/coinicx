import React, { Fragment, useState } from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils/cn";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
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
  headerClassName?: string;
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
  headerClassName,
  onOpenChange,
  onPointerDownOutside,
  onOpenAutoFocus,
}: Props) => {
  const [controlOpen, setControlOpen] = useState(!!open);

  const handleOpenChange = (value: boolean) => {
    setControlOpen(value);
    onOpenChange?.(value);
  };

  return (
    <Fragment>
      {/* We've observed a weird issue with the drawer in standalone mode when the trigger is inside the drawer.
       * The drawer was jarring, not allowing users to interact with the content.
       * This behavior was observed in two scenarios:
       * 1. When the content of the page exceeds the viewport height and user scroll through the content then attempt to interact with the trigger.
       *    The drawer could open but won't close again.
       * 2. When the drawer is opened inside the columns array of tanstack table. The drawer was misbehaving, content jarring, not allowing user to interact.
       *    Clicking anywhere inside the drawer was causing triggering actions that were not intended and also re-rendering content outside the drawer.
       *
       * To fix this, we're moving the trigger outside the drawer and wrap it in a slot. At least this way the weird behavior is contained.
       */}
      {trigger && (
        <Slot.Root onClick={() => handleOpenChange(true)}>{trigger}</Slot.Root>
      )}

      <Drawer open={controlOpen} onOpenChange={handleOpenChange}>
        <DrawerContent
          className={className}
          onPointerDownOutside={onPointerDownOutside}
          onOpenAutoFocus={onOpenAutoFocus}
        >
          <DrawerHeader
            className={cn(
              { "sr-only": !title && !description },
              headerClassName,
            )}
          >
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>

          {children}
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export default DrawerSheet;
