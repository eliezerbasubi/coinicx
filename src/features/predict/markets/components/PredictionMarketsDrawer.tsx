import React, { Suspense, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import MarketEventListingSkeleton from "@/features/predict/components/MarketEventListingSkeleton";

import MarketEventsListing from "./MarketEventsListing";

type Props = { trigger: React.ReactNode };

const PredictionMarketsDrawer = ({ trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Slot.Root data-slot="drawer-trigger" onClick={() => setOpen(true)}>
        {trigger}
      </Slot.Root>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="w-full p-0 standalone:pt-safe-top flex flex-col">
          <div className="w-full flex-1 overflow-y-auto overflow-x-hidden no-scrollbars">
            <DrawerHeader className="sticky top-0 z-10 bg-primary-dark gap-0 px-4 pt-4">
              <DrawerTitle className="w-full flex items-center justify-center gap-2">
                <DrawerClose asChild>
                  <ArrowLeft className="size-5" />
                </DrawerClose>
                <p className="flex-1 text-center text-base text-white font-semibold">
                  Predictions
                </p>
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                Showing prediction markets
              </DrawerDescription>
            </DrawerHeader>

            {/* We suspend because we are using useSuspenseQuery to fetch predictions */}
            <Suspense
              fallback={
                <div className="w-full">
                  <div className="px-4">
                    {/* Tabs */}
                    <Skeleton className="w-full h-11 bg-neutral-gray-600 mt-4 px-4" />
                    {/* Search */}
                    <Skeleton className="w-full h-8 bg-neutral-gray-600 mt-2 px-4" />
                  </div>

                  <MarketEventListingSkeleton />
                </div>
              }
            >
              <MarketEventsListing />
            </Suspense>
          </div>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default PredictionMarketsDrawer;
