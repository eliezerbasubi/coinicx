import { Fragment, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Slot } from "radix-ui";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import SettingsTrigger from "./SettingsTrigger";
import SwapForm from "./SwapForm";

type Props = {
  trigger: React.ReactNode;
};

const SwapDrawer = ({ trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <Slot.Root data-slot="drawer-trigger" onClick={() => setOpen(true)}>
        {trigger}
      </Slot.Root>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="p-0 pt-4 standalone:pt-safe-top">
          <div
            id="swap-container"
            className="w-full max-w-116.25 mx-auto px-4 md:px-2 md:pb-4 overflow-y-auto overflow-x-hidden no-scrollbars"
          >
            <DrawerHeader className="sticky top-0 z-10 bg-primary-dark gap-0 p-0 mb-4">
              <DrawerTitle className="w-full flex items-center justify-between gap-2">
                <DrawerClose asChild>
                  <ArrowLeft className="size-5" />
                </DrawerClose>
                <p className="text-base text-white font-semibold">Swap</p>
                <SettingsTrigger />
              </DrawerTitle>

              <DrawerDescription className="sr-only">
                Swap any spot assets
              </DrawerDescription>
            </DrawerHeader>

            <SwapForm />
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export default SwapDrawer;
