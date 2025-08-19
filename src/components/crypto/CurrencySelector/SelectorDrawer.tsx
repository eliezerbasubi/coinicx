import React from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type Props = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
};

const SelectorDrawer = ({ open, onOpenChange, trigger, children }: Props) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger className="w-fit flex items-center shrink-0">
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="h-full !max-h-[90vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>

        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default SelectorDrawer;
