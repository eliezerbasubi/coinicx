import { useState } from "react";
import { ChevronDown } from "lucide-react";

import AdaptivePopover from "@/components/ui/adaptive-popover";
import { useTradeContext } from "@/store/trade/hooks";
import { cn } from "@/utils/cn";

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

const TIFSelector = () => {
  const timeInForce = useTradeContext((s) => s.orderFormSettings.timeInForce);
  const orderType = useTradeContext((s) => s.orderFormSettings.orderType);

  const setOrderFormSettings = useTradeContext((s) => s.setOrderFormSettings);

  const [open, setOpen] = useState(false);

  const onValueChange = (value: string) => {
    setOpen(false);
    setOrderFormSettings({ timeInForce: value });
  };

  if (orderType !== "limit") return null;

  return (
    <AdaptivePopover
      open={open}
      onOpenChange={setOpen}
      className="p-0"
      collisionPadding={16}
      trigger={
        <div className="flex items-center text-neutral-gray-400 space-x-1">
          <p className="text-xs font-medium cursor-pointer uppercase">
            {timeInForce}
          </p>
          <ChevronDown
            strokeWidth={2.5}
            className="transition-transform group-data-[state=open]:rotate-180 size-4"
          />
        </div>
      }
    >
      <p className="text-sm text-neutral-gray-400 font-semibold block md:hidden">
        Time in Force
      </p>

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
