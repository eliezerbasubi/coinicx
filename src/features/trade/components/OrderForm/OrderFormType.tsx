import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { OrderType } from "@/types/trade";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { useTradeContext } from "@/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/store/trade/order-form";
import { cn } from "@/utils/cn";

const ORDER_TYPES: Record<
  OrderType,
  { label: string; value: OrderType; perpsOnly?: boolean }
> = {
  market: { label: "Market", value: "market" },
  limit: { label: "Limit", value: "limit" },
  stopLimit: { label: "Stop Limit", value: "stopLimit", perpsOnly: true },
  stopMarket: { label: "Stop Market", value: "stopMarket", perpsOnly: true },
  scale: { label: "Scale", value: "scale" },
  twap: { label: "TWAP", value: "twap" },
};

const FEATURED_ORDER_TYPES = [ORDER_TYPES.market, ORDER_TYPES.limit];

const MORE_ORDER_TYPES = Object.values(ORDER_TYPES).filter(
  (type) =>
    !FEATURED_ORDER_TYPES.some((featured) => featured.value === type.value),
);

const OrderFormType = () => {
  const orderType = useShallowOrderFormStore((s) => s.settings.orderType);
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  const [open, setOpen] = useState(false);

  const isNonPrimaryType = orderType !== "limit" && orderType !== "market";

  const currentOrderType = ORDER_TYPES[orderType];

  const orderTypes = isPerps
    ? MORE_ORDER_TYPES
    : MORE_ORDER_TYPES.filter((type) => !type.perpsOnly);

  const onTypeChange = (type: OrderType) => {
    useOrderFormStore.getState().setSettings({ orderType: type });
  };

  useEffect(() => {
    if (currentOrderType.perpsOnly && !isPerps) {
      onTypeChange(ORDER_TYPES.scale.value);
    }
  }, [isPerps, currentOrderType]);

  return (
    <div className="flex items-center gap-4 px-4 h-11 border-b border-neutral-gray-200">
      {FEATURED_ORDER_TYPES.map((type) => (
        <span
          key={type.value}
          className={cn(
            "text-xs text-neutral-gray-400 font-semibold cursor-pointer transition-colors",
            { "text-white": orderType === type.value },
          )}
          onClick={() => onTypeChange(type.value)}
        >
          {type.label}
        </span>
      ))}

      <AdaptiveTooltip
        open={open}
        hideArrow
        side="bottom"
        title="Order Types"
        onOpenChange={setOpen}
        trigger={
          <div
            className={cn(
              "w-fit py-2 flex items-center gap-x-1 text-xs font-semibold text-neutral-gray-400 cursor-pointer",
              { "text-white": isNonPrimaryType },
            )}
          >
            <p>
              {isNonPrimaryType
                ? ORDER_TYPES[orderType].label
                : orderTypes[0].label}
            </p>
            <ChevronDown
              className="size-3 text-neutral-gray-400"
              strokeWidth={4}
            />
          </div>
        }
      >
        <ul className="w-full text-sm md:text-xs text-neutral-gray-400 font-medium">
          {orderTypes.map((type) => (
            <li
              key={type.value}
              onClick={() => {
                onTypeChange(type.value);
                setOpen(false);
              }}
              className={cn(
                "py-2 px-4 md:px-2 cursor-pointer hover:bg-neutral-gray-200 hover:text-white",
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
      </AdaptiveTooltip>
    </div>
  );
};

export default OrderFormType;
