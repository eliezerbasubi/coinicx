import { ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInstrumentStore } from "@/store/trade/instrument";
import { useOrderFormStore } from "@/store/trade/order-form";
import { cn } from "@/utils/cn";

type Props = {
  onValueChange: (value: boolean) => void;
};

const SizeCoinSelector = ({ onValueChange }: Props) => {
  const base = useInstrumentStore((s) => s.assetMeta?.base || "");
  const quote = useInstrumentStore((s) => s.assetMeta?.quote || "");

  const isSzInNtl = useOrderFormStore((s) => s.settings.isSzInNtl);

  const options = [
    { label: base, value: false },
    { label: quote, value: true },
  ];

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-x-1">
        <p className="text-white text-sm font-medium">
          {isSzInNtl ? quote : base}
        </p>
        <ChevronDown strokeWidth={2.5} className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 flex flex-col w-20"
        collisionPadding={16}
        sideOffset={10}
      >
        {options.map((option) => (
          <PopoverClose
            key={option.label}
            onClick={() => onValueChange(option.value)}
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

export default SizeCoinSelector;
