import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { OrderType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";

const SUPPORTED_ORDER_TYPES: Record<
  OrderType,
  { label: string; value: OrderType; perpsOnly?: boolean; featured?: boolean }
> = {
  market: { label: "Market", value: "market", featured: true },
  limit: { label: "Limit", value: "limit", featured: true },
  stopLimit: { label: "Stop Limit", value: "stopLimit", perpsOnly: true },
  stopMarket: { label: "Stop Market", value: "stopMarket", perpsOnly: true },
  scale: { label: "Scale", value: "scale" },
  twap: { label: "TWAP", value: "twap" },
};

const FEATURED_ORDER_TYPES = [
  SUPPORTED_ORDER_TYPES.market,
  SUPPORTED_ORDER_TYPES.limit,
];

const ALL_SUPPORTED_TYPES = Object.values(SUPPORTED_ORDER_TYPES);

// Order types that will be displayed in the tooltip
const OTHER_ORDER_TYPES = ALL_SUPPORTED_TYPES.filter((type) => !type.featured);

const OrderFormType = () => {
  const isMobile = useIsMobile();
  const orderType = useShallowOrderFormStore((s) => s.settings.orderType);
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  const [open, setOpen] = useState(false);

  const isUnfeatured = orderType !== "limit" && orderType !== "market";

  const currentOrderType = SUPPORTED_ORDER_TYPES[orderType];

  // Inside popover we display all the supported order types on mobile, and only the
  const listedOrderTypes = isMobile ? ALL_SUPPORTED_TYPES : OTHER_ORDER_TYPES;

  // Filter out order types supported by the current instrument
  const instrumentOrderTypes = isPerps
    ? listedOrderTypes
    : listedOrderTypes.filter((type) => !type.perpsOnly);

  // Default to current order type if featured. This is for handling device viewport changes
  const [unfeaturedType, setUnfeaturedType] = useState<OrderType>(
    !currentOrderType.featured
      ? currentOrderType.value
      : instrumentOrderTypes[0].value,
  );

  const selectedOrderTypeLabel = isMobile
    ? currentOrderType.label
    : SUPPORTED_ORDER_TYPES[unfeaturedType].label;

  const onTypeChange = (type: OrderType) => {
    useOrderFormStore.getState().setSettings({ orderType: type });
  };

  useEffect(() => {
    if (currentOrderType.perpsOnly && !isPerps) {
      onTypeChange(SUPPORTED_ORDER_TYPES.scale.value);
    }
  }, [isPerps, currentOrderType]);

  return (
    <div className="flex items-center gap-4 md:px-4 md:h-11 md:border-b border-neutral-gray-200">
      <Visibility visible={!isMobile}>
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
      </Visibility>

      <AdaptiveTooltip
        open={open}
        hideArrow
        side="bottom"
        title="Order Types"
        onOpenChange={setOpen}
        trigger={
          <div
            className={cn(
              "w-full md:w-fit py-1 sm:py-2 px-2 md:px-0 flex items-center gap-x-1 justify-between md:justify-start text-3xs md:text-xs font-semibold bg-neutral-gray-200 md:bg-transparent text-neutral-gray-400 rounded-md md:rounded-none cursor-pointer",
              { "text-white": isUnfeatured || isMobile },
            )}
            // Preselect the unfeatured the order type when the tooltip opens
            onClick={() => (!isMobile ? onTypeChange(unfeaturedType) : null)}
          >
            <p>{selectedOrderTypeLabel}</p>
            <ChevronDown
              className="size-3 text-neutral-gray-400"
              strokeWidth={4}
            />
          </div>
        }
      >
        <ul className="w-full text-sm md:text-xs text-neutral-gray-400 font-medium">
          {instrumentOrderTypes.map((type) => (
            <li
              key={type.value}
              onClick={() => {
                onTypeChange(type.value);
                setUnfeaturedType(type.value);
                setOpen(false);
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
          ))}
        </ul>
      </AdaptiveTooltip>
    </div>
  );
};

export default OrderFormType;
