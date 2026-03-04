import React from "react";

import { InputNumberControl } from "@/components/ui/input-number";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import OrderFormSlider from "./OrderFormSlider";
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
      <OrderFormSlider
        value={szPercent}
        onValueChange={(value) =>
          useOrderFormStore.getState().onPercentChange(value, isSpot)
        }
      />
    </React.Fragment>
  );
};

export default OrderFormSize;
