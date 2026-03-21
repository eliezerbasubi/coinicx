import { ArrowLeft } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

import SettingsTrigger from "./SettingsTrigger";
import SwapForm from "./SwapForm";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SwapDrawer = ({ open, onOpenChange }: Props) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerTitle className="sr-only">Swap</DrawerTitle>
      <DrawerContent className="w-full! border-l-0! px-0 pt-4 standalone:pt-safe-top">
        <div
          id="swap-container"
          className="w-full max-w-116.25 mx-auto px-4 md:px-2 md:pb-4"
        >
          <div className="w-full flex items-center justify-between gap-2 mb-4">
            <DrawerClose asChild>
              <ArrowLeft className="size-5" />
            </DrawerClose>
            <h1 className="text-base text-white font-semibold">Swap</h1>
            <SettingsTrigger />
          </div>

          <SwapForm />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SwapDrawer;
