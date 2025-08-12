import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";

import {
  AssetType,
  ICryptoCurrency,
  ICurrency,
  MarketType,
  TokenInputType,
} from "@/types/market";
import { ROUTES } from "@/constants/routes";
import { useCryptoMarketContext } from "@/store/markets/hook";
import { cn } from "@/utils/cn";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useCurrentAssets } from "./hooks";
import { useExchangeRate } from "./hooks/useExchangeRate";
import TokenInput from "./TokenInput";

const CurrencySelector = dynamic(() => import("./CurrencySelector"));

const NAV_ITEMS: Array<{ value: MarketType; label: string }> = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
];

const replaceUrlPath = (args: {
  marketType: MarketType;
  fiatAssetCode: string;
  cryptoAssetCode: string;
}) => {
  const mainPath =
    args.marketType === "sell" ? ROUTES.crypto.sell : ROUTES.crypto.buy;

  const newPath = [
    mainPath,
    args.fiatAssetCode.toUpperCase(),
    args.cryptoAssetCode.toUpperCase(),
  ];

  window.history.replaceState({}, "", newPath.join("/"));
};

const TransactionForm = () => {
  const inputsContainerRef = useRef<HTMLDivElement | null>(null);

  const marketType = useCryptoMarketContext((s) => s.marketType);
  const isLoading = useCryptoMarketContext((s) => s.isLoadingAssets);
  const marketAssets = useCryptoMarketContext((s) => s.marketAssets);
  const assetsByTokenType = marketAssets[marketType];

  const { selectedAssets, fiatAssetCode, cryptoAssetCode } = useCurrentAssets();

  const setSelectedAssets = useCryptoMarketContext((s) => s.setSelectedAssets);
  const setMarketType = useCryptoMarketContext((s) => s.setMarketType);

  const [amountsByAssetType, setAmountsByAssetType] = useState<
    Record<TokenInputType, string> & { current: TokenInputType }
  >({ tokenIn: "", tokenOut: "", current: "tokenIn" });

  const exchangeRateOpts = useMemo(() => {
    const fiatToCrypto = {
      baseCurrency: fiatAssetCode,
      quoteCurrency: cryptoAssetCode,
    };
    const cryptoToFiat = {
      baseCurrency: cryptoAssetCode,
      quoteCurrency: fiatAssetCode,
    };

    if (marketType === "buy") {
      return {
        tokenIn: fiatToCrypto,
        tokenOut: cryptoToFiat,
      };
    }

    return {
      tokenIn: cryptoToFiat,
      tokenOut: fiatToCrypto,
    };
  }, [marketType, amountsByAssetType.current, fiatAssetCode, cryptoAssetCode]);

  const { computeExchangeRate } = useExchangeRate();

  const handleExchange = useCallback(() => {
    const value = amountsByAssetType[amountsByAssetType.current];
    const outputTokenInputType: TokenInputType =
      amountsByAssetType.current === "tokenIn" ? "tokenOut" : "tokenIn";

    const exchangeRate = computeExchangeRate(
      exchangeRateOpts[amountsByAssetType.current],
    );

    if (!exchangeRate) return;

    const amount = String(
      Number(value === "" ? 0 : value) * (exchangeRate.value ?? 1),
    );

    setAmountsByAssetType((state) => ({
      ...state,
      [outputTokenInputType]: amount,
    }));
  }, [
    amountsByAssetType.current,
    amountsByAssetType.tokenIn,
    amountsByAssetType.tokenOut,
    exchangeRateOpts,
  ]);

  useEffect(() => {
    handleExchange();
  }, [handleExchange]);

  const onValueChange = (args: {
    currency: ICurrency;
    assetType: AssetType;
    cryptoAssetDetails?: ICryptoCurrency;
  }) => {
    let { crypto, fiat } = selectedAssets!;

    if (args.assetType === "fiat") {
      fiat = args.currency;
    } else {
      crypto = args.currency;
    }

    replaceUrlPath({
      marketType,
      fiatAssetCode: fiat.assetCode,
      cryptoAssetCode: crypto.assetCode,
    });

    if (args.cryptoAssetDetails) {
      setSelectedAssets({ cryptoAssetDetails: args.cryptoAssetDetails });
    }

    setSelectedAssets({
      fiat,
      crypto,
    });
  };

  const onNavItemClick = useCallback(
    (marketType: MarketType) => {
      if (!selectedAssets) return;

      replaceUrlPath({
        marketType,
        fiatAssetCode: selectedAssets.fiat.assetCode,
        cryptoAssetCode: selectedAssets.crypto.assetCode,
      });

      setMarketType(marketType);
    },
    [selectedAssets?.crypto.assetCode, selectedAssets?.fiat.assetCode],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Limit amount to a million
    if (Number(value) >= 1e9) {
      e.preventDefault();
      return;
    }

    setAmountsByAssetType((state) => ({
      ...state,
      [name]: value,
      current: name as TokenInputType,
    }));
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
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.value}
              current={marketType}
              marketType={item.value}
              label={item.label}
              onClick={onNavItemClick}
            />
          ))}
        </nav>
      </div>

      <div className="bg-primary-dark rounded-2xl overflow-hidden -mt-5">
        <div ref={inputsContainerRef} className="p-6 space-y-4">
          <TokenInput
            label="Spend"
            name="tokenIn"
            placeholder="Enter Amount"
            value={amountsByAssetType.tokenIn}
            onChange={onChange}
            trailing={
              isLoading ? (
                <Skeleton />
              ) : (
                selectedAssets?.[assetsByTokenType.tokenIn.assetType] && (
                  <CurrencySelector
                    value={selectedAssets[assetsByTokenType.tokenIn.assetType]}
                    currencies={assetsByTokenType.tokenIn.list}
                    collisionBoundary={inputsContainerRef.current}
                    onValueChange={(currency, cryptoAssetDetails) =>
                      onValueChange({
                        currency,
                        assetType: assetsByTokenType.tokenIn.assetType,
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
            value={amountsByAssetType.tokenOut}
            onChange={onChange}
            trailing={
              isLoading ? (
                <Skeleton />
              ) : (
                selectedAssets?.[assetsByTokenType.tokenOut.assetType] && (
                  <CurrencySelector
                    value={selectedAssets[assetsByTokenType.tokenOut.assetType]}
                    currencies={assetsByTokenType.tokenOut.list}
                    collisionBoundary={inputsContainerRef.current}
                    onValueChange={(currency, cryptoAssetDetails) =>
                      onValueChange({
                        currency,
                        assetType: assetsByTokenType.tokenOut.assetType,
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

const NavItem = React.memo(
  ({
    current,
    label,
    marketType,
    onClick,
  }: {
    current: MarketType;
    label: string;
    marketType: MarketType;
    onClick?: (marketType: MarketType) => void;
  }) => {
    const isCurrent = current === marketType;
    const skewX = 15;

    return (
      <div
        tabIndex={0}
        role="button"
        onKeyDown={() => null}
        onClick={() => onClick?.(marketType)}
        className="w-full h-full cursor-pointer"
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
                marketType === "buy",
              "before:block before:absolute before:inset-y-0 before:-left-6 before:w-6 before:rounded-2xl before:bg-[var(--color-current)] before:skew-x-[var(--skew-x)]":
                marketType === "sell",
              "bg-primary-dark text-white": isCurrent,
            },
          )}
        >
          <p>{label}</p>
        </div>
      </div>
    );
  },
);

export default TransactionForm;
