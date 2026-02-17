import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useTradeContext } from "@/store/trade/hooks";

import OrderForm from "./OrderForm";

const OrderFormMobile = () => {
  const [open, setOpen] = useState(false);

  const setOrderSide = useTradeContext((s) => s.setOrderSide);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="fixed bottom-0 inset-x-0 z-10 h-14 px-4">
          <div className="w-full flex items-center gap-2">
            <Button
              type="button"
              size="default"
              className="flex-1 font-bold bg-buy hover:bg-buy/70 text-white capitalize rounded-lg"
              onClick={() => setOrderSide("buy")}
            >
              Buy
            </Button>
            <Button
              type="button"
              size="default"
              className="flex-1 font-bold bg-sell hover:bg-sell/70 text-white capitalize rounded-lg"
              onClick={() => setOrderSide("sell")}
            >
              Sell
            </Button>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>

        <OrderForm />
      </DrawerContent>
    </Drawer>
  );
};

export default OrderFormMobile;
