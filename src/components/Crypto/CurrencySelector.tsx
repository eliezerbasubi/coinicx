import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";

import { ICryptoCurrency, ICurrency } from "@/types/market";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

import { mapCryptoToAssetCurrency } from "./utils/mapCryptoToAssetCurrency";

type Props = {
  value: ICurrency;
  currencies: Array<ICurrency | ICryptoCurrency>;
  collisionBoundary?: Element | null;
  onValueChange?: (
    value: ICurrency,
    cryptoAssetDetails?: ICryptoCurrency,
  ) => void;
};

const CurrencySelector = ({
  value,
  currencies,
  collisionBoundary,
  onValueChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCurrencies = useMemo(() => {
    const searchQuery = search.toLowerCase();

    if (!search) return currencies;
    return currencies.filter(
      (currency) =>
        currency.symbol.toLowerCase().includes(searchQuery) ||
        ("name" in currency &&
          currency.name.toLowerCase().includes(searchQuery)) ||
        ("assetName" in currency &&
          currency.assetName.toLowerCase().includes(searchQuery)) ||
        ("assetCode" in currency &&
          currency.assetCode.toLowerCase().includes(searchQuery)),
    );
  }, [search, currencies]);

  const onClick = (value: ICurrency, cryptoAssetDetails?: ICryptoCurrency) => {
    onValueChange?.(value, cryptoAssetDetails);
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
            value={search}
            onChange={({ target: { value } }) => setSearch(value)}
          />
        </div>

        <div className="h-60 overflow-y-auto">
          {filteredCurrencies.map((currency) => {
            const assetCurrency =
              "assetCode" in currency
                ? currency
                : mapCryptoToAssetCurrency(currency);

            const isActive =
              assetCurrency.assetCode === value.assetCode &&
              assetCurrency.symbol === value.symbol;

            return (
              <div
                key={
                  assetCurrency.assetCode +
                  assetCurrency.symbol +
                  assetCurrency.assetName
                }
                role="button"
                tabIndex={0}
                onKeyDown={() => null}
                onClick={() =>
                  onClick(
                    assetCurrency,
                    !("assetCode" in currency) ? currency : undefined,
                  )
                }
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-neutral-gray-200",
                  {
                    "bg-neutral-gray-200": isActive,
                  },
                )}
              >
                <Image
                  unoptimized
                  src={assetCurrency.assetLogo}
                  alt={assetCurrency.assetName}
                  width={20}
                  height={20}
                  className="size-5 rounded-full shrink-0"
                />

                <div className="w-full flex items-center space-x-3">
                  <p className="font-semibold uppercase">
                    {assetCurrency.assetCode}
                  </p>
                  <p className="text-neutral-gray-400 text-sm">
                    {assetCurrency.assetName}
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
