import { useShallowInstrumentStore } from "@/store/trade/instrument";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";

import OrderFormInput from "./OrderFormInput";

const ScaleOrderForm = () => {
  const quote = useShallowInstrumentStore((s) => s.assetMeta?.quote);
  const orderType = useOrderFormStore((s) => s.settings.orderType);

  const state = useShallowOrderFormStore((s) => s.scaleFormState);

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useOrderFormStore.getState().setScaleFormState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  if (orderType !== "scale") return null;

  return (
    <div className="w-full space-y-2">
      <OrderFormInput
        name="startPrice"
        id="startPrice"
        label="Start Price"
        className="text-sm"
        trailing={
          <div className="flex items-center gap-x-2">
            <span className="text-neutral-300 text-sm font-medium">
              {quote}
            </span>
          </div>
        }
        value={state.startPrice}
        onChange={onValueChange}
      />
      <OrderFormInput
        name="endPrice"
        id="endPrice"
        label="End Price"
        className="text-sm"
        trailing={
          <div className="flex items-center gap-x-2">
            <span className="text-neutral-300 text-sm font-medium">
              {quote}
            </span>
          </div>
        }
        value={state.endPrice}
        onChange={onValueChange}
      />

      <div className="grid grid-cols-2 gap-2">
        <OrderFormInput
          name="totalOrders"
          id="totalOrders"
          label="Orders"
          className="text-sm"
          min={2}
          max={100}
          value={state.totalOrders}
          onChange={onValueChange}
        />
        <OrderFormInput
          name="skew"
          id="skew"
          label="Skew"
          className="text-sm"
          min={1}
          max={100}
          value={state.skew}
          onChange={onValueChange}
        />
      </div>
    </div>
  );
};

export default ScaleOrderForm;
