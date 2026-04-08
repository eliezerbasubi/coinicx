import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TradingButton from "@/components/common/TradingButton";
import TIFSelector from "@/features/trade/components/OrderForm/TIFSelector";

import PredictOrderFormHeader from "./PredictOrderFormHeader";
import PredictOrderFormLimit from "./PredictOrderFormLimit";
import PredictOrderFormSize from "./PredictOrderFormSize";

type Props = {
  className?: string;
};

const PredictTradingForm = ({ className }: Props) => {
  return (
    <div className={cn("w-full", className)}>
      <PredictOrderFormHeader />

      <div className="w-full px-4">
        <PredictOrderFormLimit />
        <PredictOrderFormSize />

        <div className="w-full border-t border-neutral-gray-200 pt-4 mt-4">
          <TIFSelector className="w-full justify-end mb-3" />
          <div className="flex items-center justify-between mb-2">
            <p className="text-base text-neutral-gray-400 font-medium leading-5">
              Order Value
            </p>
            <p className="text-xl font-medium">
              {formatNumber(0, { style: "currency" })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base text-neutral-gray-400 font-medium leading-5">
              To Win
            </p>
            <p className="text-xl font-semibold text-buy">
              {formatNumber(0, { style: "currency" })}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 mt-4">
        <TradingButton label="Trade" />
      </div>
    </div>
  );
};

export default PredictTradingForm;
