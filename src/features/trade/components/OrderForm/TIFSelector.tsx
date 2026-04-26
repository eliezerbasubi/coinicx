import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  useOrderFormStore,
  useShallowOrderFormStore,
} from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import AdaptivePopover from "@/components/ui/adaptive-popover";
import { isLimitOrScaleOrder } from "@/features/trade/utils/orderTypes";

const TIF_OPTIONS = [
  {
    title: "GTC (Good Til Cancel)",
    description:
      "An order that rests on the orderbook until it is filled or canceled",
    value: "Gtc",
  },
  {
    title: "IOC (Immediate or Cancel)",
    description: "An order that will be canceled if not filled immediately",
    value: "Ioc",
  },
  {
    title: "ALO (Add Liquidity Only/Post Only)",
    description:
      "An order that will exist only as a limit order on the orderbook",
    value: "Alo",
  },
];

type Props = {
  className?: string;
};

const TIFSelector = ({ className }: Props) => {
  const { orderType, timeInForce } = useShallowOrderFormStore((s) => ({
    orderType: s.settings.orderType,
    timeInForce: s.settings.timeInForce,
  }));

  const [open, setOpen] = useState(false);

  const onValueChange = (value: string) => {
    setOpen(false);
    useOrderFormStore.getState().setSettings({ timeInForce: value });
  };

  if (!isLimitOrScaleOrder(orderType)) return null;

  return (
    <AdaptivePopover
      open={open}
      onOpenChange={setOpen}
      className="p-0"
      align="start"
      collisionPadding={16}
      title={<span className="px-4 md:px-0">Time in Force</span>}
      trigger={
        <div
          className={cn("flex items-center text-white space-x-1", className)}
        >
          <p className="text-3xs md:text-xs font-medium cursor-pointer uppercase space-x-1">
            <span className="text-neutral-gray-400">TIF</span>
            <span>{timeInForce}</span>
          </p>
          <ChevronDown
            strokeWidth={2.5}
            className="transition-transform group-data-[state=open]:rotate-180 size-4"
          />
        </div>
      }
    >
      {TIF_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={cn(
            "w-full text-left px-4 py-2 hover:bg-neutral-gray-200 outline-0",
            {
              "bg-neutral-gray-200": timeInForce === option.value,
            },
          )}
          onClick={() => onValueChange(option.value)}
        >
          <p className="text-sm font-medium text-white">{option.title}</p>
          <p className="text-xs font-medium text-neutral-gray-400">
            {option.description}
          </p>
        </button>
      ))}
    </AdaptivePopover>
  );
};

export default TIFSelector;
