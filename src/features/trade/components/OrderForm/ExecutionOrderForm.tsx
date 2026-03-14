import React from "react";

import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { isLimitOrder, isStopOrder } from "@/features/trade/utils/orderTypes";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import OrderFormInput from "./OrderFormInput";
import TrailingQuote from "./TrailingQuote";

const ExecutionOrderForm = () => {
  const quote = useShallowInstrumentStore((s) => s.assetMeta?.quote);
  const { orderType, triggerPrice, limitPrice } = useShallowOrderFormStore(
    (s) => ({
      orderType: s.settings.orderType,
      triggerPrice: s.triggerPrice,
      limitPrice: s.limitPrice,
    }),
  );

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useOrderFormStore.getState().setExecutionOrder({
      [e.target.name]: e.target.value,
    });
  };

  return (
    <React.Fragment>
      <Visibility visible={isStopOrder(orderType)}>
        <OrderFormInput
          name="triggerPrice"
          id="triggerPrice"
          value={triggerPrice}
          label="Stop Price"
          trailing={<TrailingQuote />}
          onChange={onValueChange}
        />
      </Visibility>
      <Visibility visible={isLimitOrder(orderType)}>
        <OrderFormInput
          name="limitPrice"
          id="limitPrice"
          value={limitPrice}
          label="Price"
          trailing={
            <div className="flex items-center gap-x-2">
              <span className="text-neutral-300 text-3xs md:text-sm font-medium">
                {quote}
              </span>

              <Button
                type="button"
                variant="ghost"
                className="size-6 bg-neutral-gray-200 text-neutral-300 hover:text-primary hover:bg-primary/10 text-3xs md:text-xs font-semibold"
                onClick={() => useOrderFormStore.getState().onMidClick()}
              >
                Mid
              </Button>
            </div>
          }
          onChange={onValueChange}
        />
      </Visibility>
    </React.Fragment>
  );
};

export default ExecutionOrderForm;
