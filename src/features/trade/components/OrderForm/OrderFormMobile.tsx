import React, { useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { OrderSide } from "@/types/trade";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useOrderFormStore } from "@/store/trade/order-form";

import OrderForm from "./OrderForm";

const OrderFormMobile = () => {
  const [open, setOpen] = useState(false);

  const onSideChange = (side: OrderSide) => {
    useOrderFormStore.getState().setOrderSide(side);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="fixed bottom-0 inset-x-0 z-10 h-14 px-4">
          <div className="w-full flex items-center gap-2">
            <Button
              type="button"
              size="default"
              className="flex-1 font-bold bg-buy hover:bg-buy/70 text-white capitalize rounded-lg"
              onClick={() => onSideChange("buy")}
            >
              Buy
            </Button>
            <Button
              type="button"
              size="default"
              className="flex-1 font-bold bg-sell hover:bg-sell/70 text-white capitalize rounded-lg"
              onClick={() => onSideChange("sell")}
            >
              Sell
            </Button>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>

        <DrawerPrimitive.NestedRoot>
          <OrderForm className="flex-1 overflow-y-auto" />
        </DrawerPrimitive.NestedRoot>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderFormMobile;
