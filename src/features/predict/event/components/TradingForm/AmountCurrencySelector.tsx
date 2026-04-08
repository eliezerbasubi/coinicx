import { ChevronDown } from "lucide-react";

import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AmountCurrencySelector = () => {
  const isSzInNtl = useOrderFormStore((s) => s.settings.isSzInNtl);

  const options = [
    { label: "In Contracts", value: false },
    { label: "In Dollars", value: true },
  ];

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-x-1">
        <p className="text-white text-xs font-medium">
          {isSzInNtl ? options[1].label : options[0].label}
        </p>
        <ChevronDown strokeWidth={2.5} className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 flex flex-col w-fit"
        collisionPadding={16}
        sideOffset={10}
      >
        {options.map((option) => (
          <PopoverClose
            key={option.label}
            onClick={() =>
              useOrderFormStore
                .getState()
                .setSettings({ isSzInNtl: option.value })
            }
            className={cn(
              "text-sm text-left text-neutral-gray-400 hover:bg-neutral-gray-200 hover:text-white font-medium py-2 px-3",
              {
                "bg-neutral-gray-200 text-white": isSzInNtl === option.value,
              },
            )}
          >
            {option.label}
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default AmountCurrencySelector;
