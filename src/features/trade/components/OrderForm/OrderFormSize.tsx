import React from "react";

import FormInputSlider from "@/components/common/FormInputSlider";
import { InputNumberControl } from "@/components/ui/input-number";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import SizeCoinSelector from "./SizeCoinSelector";

const OrderFormSize = () => {
  const isSpot = useTradeContext((s) => s.instrumentType === "spot");
  const { szPercent, size } = useShallowOrderFormStore((s) => ({
    szPercent: s.szPercent,
    size: s.size,
  }));

  return (
    <React.Fragment>
      <InputNumberControl
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
