import { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Slot } from "radix-ui";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const PortfolioChart = dynamic(() => import("./PortfolioChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-neutral-gray-200 rounded-md h-71.5" />
  ),
});
const PortfolioOverview = dynamic(() => import("./PortfolioOverview"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-neutral-gray-200/50 rounded-md h-62.75" />
  ),
});
const PortfolioFees = dynamic(() => import("./PortfolioFees"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-neutral-gray-200/50 rounded-md h-43.25" />
  ),
});

const PortfolioDrawer = ({ trigger }: { trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <Slot.Root data-slot="drawer-trigger" onClick={() => setOpen(true)}>
        {trigger}
      </Slot.Root>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="w-full! border-l-0! px-0 standalone:pt-safe-top overflow-y-auto overflow-x-hidden">
          <DrawerHeader className="sticky top-0 z-10 bg-primary-dark gap-0 p-4">
            <DrawerTitle className="w-full flex items-center justify-center gap-2">
              <DrawerClose asChild>
                <ArrowLeft className="size-5" />
              </DrawerClose>
              <p className="flex-1 text-center text-base text-white font-semibold">
                Portfolio
              </p>
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Showing user's portfolio
            </DrawerDescription>
          </DrawerHeader>
          <div className="w-full space-y-2">
            <div className="w-full flex flex-col md:flex-row items-stretch gap-2 px-4">
              <PortfolioOverview />
              <PortfolioChart />
            </div>

            <div className="px-4">
              <PortfolioFees />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export default PortfolioDrawer;
