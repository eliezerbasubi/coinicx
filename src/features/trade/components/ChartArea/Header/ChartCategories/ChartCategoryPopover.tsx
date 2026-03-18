import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { ChartType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CATEGORIES } from "./constants";

type Props = {
  value?: ChartType;
  onValueChange?: (value: ChartType) => void;
};

const ChartCategoryPopover = ({ value, onValueChange }: Props) => {
  const [open, setOpen] = useState(false);

  const selectedCategory = CATEGORIES.find(
    (category) => category.value === value,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-fit flex items-center justify-between gap-x-1 shrink-0 rounded text-neutral-gray-400">
        <span className="text-3xs md:text-xs font-semibold whitespace-nowrap">
          {selectedCategory?.label}
        </span>
        <ChevronDown className="size-3 md:size-4 stroke-3" />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        collisionPadding={0}
        sideOffset={10}
        className="w-32 px-0 py-1"
      >
        {CATEGORIES.map((category) => {
          return (
            <div
              key={category.value}
              role="button"
              tabIndex={0}
              onKeyDown={() => null}
              onClick={() => {
                setOpen(false);

                onValueChange?.(category.value);
              }}
              className={cn(
                "flex items-center space-x-2 p-2 cursor-pointer text-neutral-gray-400",
                {
                  "text-neutral-gray-100 font-medium": category.value === value,
                },
              )}
            >
              <p className="text-sm">{category.label}</p>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default ChartCategoryPopover;
