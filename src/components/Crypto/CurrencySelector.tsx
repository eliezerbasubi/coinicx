import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";

import { ICurrency } from "@/types/market";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

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
  const [open, setOpen] = useState(false);

  const onClick = (value: ICurrency) => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-fit flex items-center shrink-0">
        {value.assetLogo && (
          <Image
            unoptimized
            src={value.assetLogo}
            alt={value.assetName}
            width={20}
            height={20}
            className="size-5 rounded-full"
          />
        )}
        <span className="uppercase font-semibold mx-1">{value.assetCode}</span>
        <ChevronDown />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        collisionPadding={0}
        sideOffset={24}
        className="w-[398px] -mr-4"
        avoidCollisions={false}
        collisionBoundary={collisionBoundary}
      >
        <div className="flex items-center h-11 px-4 mb-4 rounded-lg border border-neutral-gray-200 hover:border-primary">
          <Search />
          <input
            type="search"
            placeholder="Search"
            className="w-full h-full outline-none caret-primary pl-4"
          />
        </div>

        <div className="h-60 overflow-y-auto">
          {currencies.map((currency) => {
            const isActive =
              currency.assetCode === value.assetCode &&
              currency.symbol === value.symbol;

            return (
              <div
                key={currency.assetCode + currency.symbol + currency.assetName}
                role="button"
                tabIndex={0}
                onKeyDown={() => null}
                onClick={() => onClick(currency)}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-neutral-gray-200",
                  {
                    "bg-neutral-gray-200": isActive,
                  },
                )}
              >
                <Image
                  unoptimized
                  src={currency.assetLogo}
                  alt={currency.assetName}
                  width={20}
                  height={20}
                  className="size-5 rounded-full shrink-0"
                />

                <div className="w-full flex items-center space-x-3">
                  <p className="font-semibold uppercase">
                    {currency.assetCode}
                  </p>
                  <p className="text-neutral-gray-400 text-sm">
                    {currency.assetName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencySelector;
