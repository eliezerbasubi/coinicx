import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { ICryptoCurrency, ICurrency } from "@/types/market";
import { cn } from "@/utils/cn";

import { mapCryptoToAssetCurrency } from "../utils/mapCryptoToAssetCurrency";

type Props = {
  value: ICurrency;
  currencies: Array<ICurrency | ICryptoCurrency>;
  collisionBoundary?: Element | null;
  onValueChange?: (
    value: ICurrency,
    cryptoAssetDetails?: ICryptoCurrency,
  ) => void;
};

const SelectorContent = ({
  currencies,
  value,
  className,
  contentClassName,
  searchClassName,
  onValueChange,
}: Props & {
  className?: string;
  contentClassName?: string;
  searchClassName?: string;
}) => {
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

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full", searchClassName)}>
        <div className="flex items-center h-11 px-4 mb-4 rounded-lg border border-neutral-gray-200 hover:border-primary">
          <Search className="text-gray-600" />
          <input
            type="search"
            name="search"
            id="search"
            placeholder="Search"
            className="w-full h-full outline-none caret-primary pl-4"
            value={search}
            onChange={({ target: { value } }) => setSearch(value)}
          />
        </div>
      </div>

      <div className={contentClassName}>
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
                onValueChange?.(
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
    </div>
  );
};

export default SelectorContent;
