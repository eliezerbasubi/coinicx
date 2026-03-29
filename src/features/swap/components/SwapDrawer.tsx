import { ArrowLeft } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import SettingsTrigger from "./SettingsTrigger";
import SwapForm from "./SwapForm";

type Props = {
  open?: boolean;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};

const SwapDrawer = ({ open, trigger, onOpenChange }: Props) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="px-0 pt-4 standalone:pt-safe-top">
        <div
          id="swap-container"
          className="w-full max-w-116.25 mx-auto px-4 md:px-2 md:pb-4"
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
  );
};

export default SwapDrawer;
