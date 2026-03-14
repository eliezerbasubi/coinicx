import React from "react";

import FormInputSlider from "@/components/common/FormInputSlider";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import OrderFormInput from "./OrderFormInput";
import SizeCoinSelector from "./SizeCoinSelector";

const OrderFormSize = () => {
  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
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
        trailing={
          <SizeCoinSelector
            onValueChange={useOrderFormStore.getState().onSizeCoinChange}
          />
        }
        onChange={(e) =>
          useOrderFormStore.getState().onSizeChange(e.target.value, isSpot)
        }
      />
      <FormInputSlider
        value={szPercent}
        onValueChange={(value) =>
          useOrderFormStore.getState().onPercentChange(value, isSpot)
        }
      />
    </React.Fragment>
  );
};

export default OrderFormSize;
