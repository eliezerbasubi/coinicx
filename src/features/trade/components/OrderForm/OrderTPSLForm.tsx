import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";

import OrderFormInput from "./OrderFormInput";

const OrderTPSLForm = () => {
  const { tpPrice, slPrice } = useShallowOrderFormStore((s) => ({
    tpPrice: s.tpslState.tpPrice,
    slPrice: s.tpslState.slPrice,
  }));

  const onValueChange = ({ name, value }: { name: string; value: string }) => {
    useOrderFormStore.getState().setTpslState({ [name]: value });
  };

  return (
    <div className="w-full space-y-2">
      <div className="w-full">
        <div className="flex items-center gap-1">
          <OrderFormInput
            label="TP Price"
            name="tpPrice"
            id="tpPrice"
            value={tpPrice}
            wrapperClassName="flex-1"
            onChange={({ target: { name, value } }) =>
              onValueChange?.({ name, value })
            }
          />
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center gap-1">
          <OrderFormInput
            label="SL Price"
            name="slPrice"
            id="slPrice"
            value={slPrice}
            wrapperClassName="flex-1"
            onChange={({ target: { name, value } }) =>
              onValueChange?.({ name, value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default OrderTPSLForm;
