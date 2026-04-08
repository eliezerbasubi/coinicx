import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value: boolean;
  base: string;
  quote: string;
  onValueChange: (value: boolean) => void;
};

const AmountPairSelector = ({ base, quote, value, onValueChange }: Props) => {
  const options = [
    { label: base, value: false },
    { label: quote, value: true },
  ];

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-x-1">
        <p className="text-white text-3xs md:text-sm font-medium">
          {value ? quote : base}
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
                "bg-neutral-gray-200 text-white": value === option.value,
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

export default AmountPairSelector;
