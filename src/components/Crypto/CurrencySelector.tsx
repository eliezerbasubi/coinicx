import React from "react";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";

import { ICurrency } from "@/types/market";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value: ICurrency;
  currencies: ICurrency[];
  collisionBoundary?: Element | null;
  onValueChange?: (value: ICurrency) => void;
};

const CurrencySelector = ({
  value,
  currencies,
  collisionBoundary,
  onValueChange,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center space-x-2">
        {value.imageUrl && (
          <Image
            unoptimized
            src={value.imageUrl}
            alt={value.fullName}
            width={40}
            height={40}
            className="size-10 rounded-full"
          />
        )}
        <span>{value.pair.split("_")[0]}</span>
        <ChevronDown />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-full"
        collisionBoundary={collisionBoundary}
      >
        <div className="flex items-center h-11 rounded-lg border border-neutral-gray-300 hover:border-primary">
          <Search />
          <input
            type="search"
            className="w-full h-full outline-none caret-primary"
          />
        </div>

        <div className="space-y-1">
          {currencies.map((currency, index) => (
            <div
              key={currency.pair + index}
              role="button"
              tabIndex={0}
              onKeyDown={() => null}
              onClick={() => onValueChange?.(currency)}
              className="flex items-center space-x-2"
            >
              <Image
                unoptimized
                src={currency.imageUrl}
                alt={currency.fullName}
                width={40}
                height={40}
                className="size-10 rounded-full shrink-0"
              />

              <div className="w-full">
                <p className="font-bold">{currency.pair.split("_")[0]}</p>
                <p className="text-neutral-gray-500">{currency.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencySelector;
