import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import FormInputControl from "@/components/common/FormInputControl";

import AmountCurrencySelector from "./AmountCurrencySelector";

const TradingWidgetOrderSize = () => {
  const size = useShallowOrderFormStore((s) => s.size);

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <AmountCurrencySelector />
      </div>
      <FormInputControl
        name="amount"
        value={size}
        label={
          <div className="flex flex-col gap-y-1">
            <p className="text-sm text-white">Amount</p>
            <p className="text-xs text-neutral-gray-400 font-medium">
              Available: 0.00
            </p>
          </div>
        }
        placeholder="0.00"
        wrapperClassName="border-none my-2 md:my-4 px-0"
        percentClassName="px-1.5"
        className="text-2xl"
        max={100}
        onChange={(e) =>
          useOrderFormStore.getState().onSizeChange(e.target.value, true)
        }
      />
    </div>
  );
};

export default TradingWidgetOrderSize;
