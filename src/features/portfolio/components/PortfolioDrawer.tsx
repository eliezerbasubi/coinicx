import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
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

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const PortfolioDrawer = ({ open, onOpenChange }: Props) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerTitle className="sr-only">Portfolio</DrawerTitle>
      <DrawerTrigger className="w-full flex items-center justify-center gap-2 border border-neutral-gray-200 rounded-lg text-neutral-gray-400 px-1 py-1.5">
        <p className="text-xs font-medium">View portfolio</p>
        <ArrowRight className="size-4" />
      </DrawerTrigger>
      <DrawerContent className="w-full! border-l-0! px-0 standalone:pt-safe-top overflow-y-auto overflow-x-hidden">
        <div className="w-full sticky top-0 bg-primary-dark flex items-center justify-center gap-2 py-4 px-4">
          <DrawerClose asChild>
            <ArrowLeft className="size-5" />
          </DrawerClose>
          <h1 className="flex-1 text-center text-base text-white font-semibold">
            Portfolio
          </h1>
        </div>
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
  );
};

export default PortfolioDrawer;
