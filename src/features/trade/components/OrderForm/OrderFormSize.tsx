import React from "react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import OrderFormInput from "./OrderFormInput";
import OrderFormSlider from "./OrderFormSlider";
import SizeCoinSelector from "./SizeCoinSelector";

const OrderFormSize = () => {
  const { szPercent, size } = useShallowOrderFormStore((s) => ({
    szPercent: s.szPercent,
    size: s.size,
  }));

  return (
    <React.Fragment>
      <OrderFormInput
        name="size"
        id="size"
        value={size}
        label="Size"
        className="text-sm"
        trailing={
          <SizeCoinSelector
            onValueChange={useOrderFormStore.getState().onSizeCoinChange}
          />
        }
        onChange={(e) =>
          useOrderFormStore.getState().onSizeChange(e.target.value)
        }
      />
      <OrderFormSlider
        value={szPercent}
        onValueChange={useOrderFormStore.getState().onPercentChange}
      />
    </React.Fragment>
  );
};

export default OrderFormSize;
