import { ChevronDown } from "lucide-react";

import { OrderType } from "@/types/trade";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";

const ORDER_TYPES: Record<OrderType, { label: string; value: OrderType }> = {
  market: { label: "Market", value: "market" },
  limit: { label: "Limit", value: "limit" },
  stopLimit: { label: "Stop Limit", value: "stopLimit" },
  stopMarket: { label: "Stop Market", value: "stopMarket" },
  scale: { label: "Scale", value: "scale" },
  twap: { label: "TWAP", value: "twap" },
};

const OrderFormType = () => {
  const orderType = useTradeContext((s) => s.orderFormSettings.orderType);
  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);

  const isNonPrimaryType = orderType !== "limit" && orderType !== "market";

  return (
    <div className="flex items-center gap-4 px-4 h-11 border-b border-neutral-gray-200">
      {[ORDER_TYPES.market, ORDER_TYPES.limit].map((type) => (
        <span
          key={type.value}
          className={cn(
            "text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            { "text-white": orderType === type.value },
          )}
          onClick={() => setOrderFormSettings({ orderType: type.value })}
        >
          {type.label}
        </span>
      ))}

      <Tooltip>
        <TooltipTrigger
          className={cn(
            "w-fit py-2 flex items-center gap-x-1 text-xs font-semibold text-neutral-gray-400 cursor-pointer",
            { "text-white": isNonPrimaryType },
          )}
        >
          <p>
            {isNonPrimaryType
              ? ORDER_TYPES[orderType].label
              : ORDER_TYPES.stopLimit.label}
          </p>
          <ChevronDown
            className="size-3 text-neutral-gray-400"
            strokeWidth={4}
          />
        </TooltipTrigger>
        <TooltipContent
          hideArrow
          side="bottom"
          className="w-32 bg-primary-dark rounded-md border border-neutral-gray-200 shadow-md p-0"
        >
          <ul className="w-full text-xs text-neutral-gray-400 font-medium">
            {Object.values(ORDER_TYPES)
              .filter(
                (orderType) =>
                  orderType.value !== "limit" && orderType.value !== "market",
              )
              .map((type) => (
                <li
                  key={type.value}
                  onClick={() =>
                    setOrderFormSettings({ orderType: type.value })
                  }
                  className={cn(
                    "py-2 px-2 cursor-pointer hover:bg-neutral-gray-200 hover:text-white",
                    {
                      "flex items-center justify-between font-semibold text-white bg-neutral-gray-200":
                        type.value === orderType,
                    },
                  )}
                >
                  <span>{type.label}</span>
                </li>
              ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default OrderFormType;
