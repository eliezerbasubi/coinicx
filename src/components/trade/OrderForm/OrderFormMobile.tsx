import React, { useState } from "react";

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

import OrderForm from "./OrderForm";

const OrderFormMobile = () => {
  const [orderSide, setOrderSide] = useState<OrderSide>();
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="fixed bottom-0 inset-x-0 h-14 px-4">
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

        <OrderForm side={orderSide} />
      </DrawerContent>
    </Drawer>
  );
};

export default OrderFormMobile;
