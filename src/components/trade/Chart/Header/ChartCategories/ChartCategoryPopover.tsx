import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { ChartType } from "@/types/trade";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

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
      <PopoverTrigger className="w-fit flex items-center justify-between shrink-0 rounded text-neutral-gray-400">
        <span className="text-xs font-semibold whitespace-nowrap mx-1">
          {selectedCategory?.label}
        </span>
        <ChevronDown className="size-4 stroke-3" />
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
