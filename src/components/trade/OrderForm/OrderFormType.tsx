import React from "react";
import { Check, ChevronDown } from "lucide-react";

import { OrderType } from "@/types/trade";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

type Props = {
  type: OrderType;
  onValueChange?: (type: OrderType) => void;
};

const ORDER_TYPES: Record<OrderType, { label: string; value: OrderType }> = {
  limit: { label: "Limit", value: "limit" },
  market: { label: "Market", value: "market" },
  stopLimit: { label: "Stop Limit", value: "stopLimit" },
  stopMarket: { label: "Stop Market", value: "stopMarket" },
  trailingStop: { label: "Trailing Stop", value: "trailingStop" },
  oco: { label: "OCO", value: "oco" },
  twap: { label: "TWAP", value: "twap" },
};

const OrderFormType = ({ type, onValueChange }: Props) => {
  const isNonPrimaryType = type !== "limit" && type !== "market";

  return (
    <div className="flex items-center gap-4 px-4 h-11">
      {[ORDER_TYPES.limit, ORDER_TYPES.market].map((orderType) => (
        <span
          key={orderType.value}
          className={cn(
            "text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            { "text-white": type === orderType.value },
          )}
          onClick={() => onValueChange?.(orderType.value)}
        >
          {orderType.label}
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
              ? ORDER_TYPES[type].label
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
              .map((orderType) => (
                <li
                  key={orderType.value}
                  onClick={() => onValueChange?.(orderType.value)}
                  className={cn("py-2 px-2 cursor-pointer", {
                    "flex items-center justify-between font-semibold text-white bg-neutral-gray-200":
                      orderType.value === type,
                  })}
                >
                  <span>{orderType.label}</span>
                  {type === orderType.value && (
                    <Check className="size-4" strokeWidth={3} />
                  )}
                </li>
              ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default OrderFormType;
