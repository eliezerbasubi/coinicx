import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { OrderType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { SUPPORTED_ORDER_TYPES } from "@/features/trade/constants";

const PredictOrderTypes = () => {
  const orderType = useShallowOrderFormStore((s) => s.settings.orderType);

  const [open, setOpen] = useState(false);

  const onTypeChange = (type: OrderType) => {
    useOrderFormStore.getState().setSettings({ orderType: type });
  };

  return (
    <div className="flex-1 flex justify-end">
      <AdaptiveTooltip
        open={open}
        hideArrow
        side="bottom"
        title="Order Types"
        onOpenChange={setOpen}
        delayDuration={0}
        trigger={
          <div
            className={cn(
              "w-full md:w-fit px-2 md:px-0 flex items-center gap-x-1 justify-between md:justify-start text-xs md:text-sm font-semibold bg-neutral-gray-200 md:bg-transparent text-neutral-gray-400 rounded-md md:rounded-none cursor-pointer",
            )}
            onClick={() => setOpen(!open)}
          >
            <p>Market</p>
            <ChevronDown className="size-5 text-neutral-gray-400" />
          </div>
        }
      >
        <ul className="w-full text-sm md:text-xs text-neutral-gray-400 font-medium">
          {Object.values(SUPPORTED_ORDER_TYPES).map((type) => {
            if (type.perpsOnly) return null;
            return (
              <li
                key={type.value}
                onClick={() => {
                  setOpen(false);
                  onTypeChange(type.value);
                }}
                className={cn(
                  "flex items-center justify-between py-2 px-0 md:px-2 cursor-pointer hover:bg-neutral-gray-200 hover:text-white",
                  {
                    "font-semibold text-white md:bg-neutral-gray-200":
                      type.value === orderType,
                  },
                )}
              >
                <span>{type.label}</span>
                {type.value === orderType && (
                  <Check className="size-3 stroke-4 text-neutral-300 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      </AdaptiveTooltip>
    </div>
  );
};

export default PredictOrderTypes;
