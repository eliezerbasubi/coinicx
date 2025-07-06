import React, { CSSProperties, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  AssetType,
  ICryptoCurrency,
  ICurrency,
  MarketType,
} from "@/types/market";
import { ROUTES } from "@/constants/routes";
import { useCryptoMarketContext } from "@/store/markets/hook";
import { cn } from "@/utils/cn";

import { Button } from "../ui/button";
import TokenInput from "./TokenInput";

const CurrencySelector = dynamic(() => import("./CurrencySelector"));

const TransactionForm = () => {
  const inputsContainerRef = useRef<HTMLDivElement | null>(null);

  const marketType = useCryptoMarketContext((s) => s.marketType);
  const isLoading = useCryptoMarketContext((s) => s.isLoadingAssets);
  const selectedAssets = useCryptoMarketContext((s) => s.selectedAssets);
  const assetsByMarketType = useCryptoMarketContext((s) => s.assetsByTokenType);
  const setSelectedAssets = useCryptoMarketContext((s) => s.setSelectedAssets);

  const onValueChange = (args: {
    currency: ICurrency;
    assetType: AssetType;
    cryptoAssetDetails?: ICryptoCurrency;
  }) => {
    const mainPath =
      marketType === "sell" ? ROUTES.crypto.sell : ROUTES.crypto.buy;

    let { crypto, fiat } = selectedAssets!;

    if (args.assetType === "fiat") {
      fiat = args.currency;
    } else {
      crypto = args.currency;
    }

    const newPath = [
      mainPath,
      `/${fiat.assetCode.toUpperCase()}`,
      `/${crypto.assetCode.toUpperCase()}`,
    ];

    window.history.replaceState({}, "", newPath.join(""));

    if (args.cryptoAssetDetails) {
      setSelectedAssets({ cryptoAssetDetails: args.cryptoAssetDetails });
    }

    setSelectedAssets({
      fiat,
      crypto,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto border border-neutral-gray-200 rounded-2xl overflow-hidden">
      <div
        className={cn(
          "h-[84px] bg-linear-[90deg] from-primary-dark from-50% to-neutral-gray-200 to-0%",
          { "from-neutral-gray-200 to-primary-dark": marketType === "sell" },
        )}
      >
        <nav className="w-full h-16 flex items-center isolate space-x-12 bg-linear-[180deg] from-neutral-gray-200 from-50% to-primary-dark to-0%">
          <NavItem current={marketType} type="buy" label="Buy" />
          <NavItem current={marketType} type="sell" label="Sell" />
        </nav>
      </div>

      <div className="bg-primary-dark rounded-2xl overflow-hidden -mt-5">
        <div ref={inputsContainerRef} className="p-6 space-y-4">
          <TokenInput
            label="Spend"
            name="tokenIn"
            placeholder="Enter Amount"
            trailing={
              isLoading ? (
                <p>...</p>
              ) : (
                selectedAssets?.[assetsByMarketType.tokenIn.assetType] && (
                  <CurrencySelector
                    value={selectedAssets[assetsByMarketType.tokenIn.assetType]}
                    currencies={assetsByMarketType.tokenIn.list}
                    collisionBoundary={inputsContainerRef.current}
                    onValueChange={(currency, cryptoAssetDetails) =>
                      onValueChange({
                        currency,
                        assetType: assetsByMarketType.tokenIn.assetType,
                        cryptoAssetDetails,
                      })
                    }
                  />
                )
              )
            }
          />
          <TokenInput
            label="Receive"
            name="tokenOut"
            placeholder="0"
            trailing={
              isLoading ? (
                <p>...</p>
              ) : (
                selectedAssets?.[assetsByMarketType.tokenOut.assetType] && (
                  <CurrencySelector
                    value={
                      selectedAssets[assetsByMarketType.tokenOut.assetType]
                    }
                    currencies={assetsByMarketType.tokenOut.list}
                    collisionBoundary={inputsContainerRef.current}
                    onValueChange={(currency, cryptoAssetDetails) =>
                      onValueChange({
                        currency,
                        assetType: assetsByMarketType.tokenOut.assetType,
                        cryptoAssetDetails,
                      })
                    }
                  />
                )
              )
            }
          />
        </div>
        <div className="p-6 mt-32">
          <Button size="lg" className="font-bold text-xl">
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({
  current,
  label,
  type,
}: {
  current: MarketType;
  label: string;
  type: MarketType;
}) => {
  const isCurrent = current === type;
  const skewX = 15;

  return (
    <Link
      href={type === "sell" ? ROUTES.crypto.sell : ROUTES.crypto.buy}
      className="w-full h-full"
    >
      <div
        style={
          {
            "--color-current": isCurrent
              ? "var(--color-primary-dark)"
              : "var(--color-neutral-gray-200)",
            "--skew-x": `${current === "sell" ? skewX * -1 : skewX}deg`,
          } as CSSProperties
        }
        className={cn(
          "relative w-full h-full flex justify-center items-center font-extrabold text-neutral-gray-300 bg-neutral-gray-200",
          {
            "after:block after:absolute after:inset-y-0 after:-right-6 after:w-6 after:rounded-2xl after:bg-[var(--color-current)] after:skew-x-[var(--skew-x)]":
              type === "buy",
            "before:block before:absolute before:inset-y-0 before:-left-6 before:w-6 before:rounded-2xl before:bg-[var(--color-current)] before:skew-x-[var(--skew-x)]":
              type === "sell",
            "bg-primary-dark text-white": isCurrent,
          },
        )}
      >
        <p>{label}</p>
      </div>
    </Link>
  );
};

export default TransactionForm;
