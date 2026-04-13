import { useMemo, useState } from "react";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import {
  ArrowRightLeft,
  BanknoteArrowDown,
  BanknoteArrowUp,
  ChartNoAxesCombined,
  ChevronDown,
  RefreshCcwDot,
  Send,
  Sparkles,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useWebHaptics } from "web-haptics/react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { usePreferencesStore } from "@/lib/store/trade/user-preferences";
import { Asset } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatAddress } from "@/lib/utils/formatting/formatAddress";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import ConnectButton from "@/components/common/ConnectButton";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import PortfolioDrawer from "@/features/portfolio/components/PortfolioDrawer";
import PredictionMarketsDrawer from "@/features/predict/markets/components/PredictionMarketsDrawer";
import SwapDrawer from "@/features/swap/components/SwapDrawer";
import PositionsOverview from "@/features/trade/components/TradingAccountPanel/Positions/PositionsOverview";
import { useAccountBalances } from "@/features/trade/hooks/useAccountBalances";
import { useAssetsAndContexts } from "@/features/trade/hooks/useAssetAndContexts";
import { useSelectToken } from "@/features/trade/hooks/useSelectToken";
import { formatPriceToDecimal, getPriceDecimals } from "@/features/trade/utils";

const HomeTabView = () => {
  return (
    <div className="w-full p-4 standalone:pt-safe-top">
      <AccountOverview />

      <AccountActions />

      <PositionsOverview />

      <TokensOverview />
    </div>
  );
};

const AccountOverview = () => {
  const { address } = useAccount();
  const { openAccountModal } = useAccountModal();
  const data = useAccountBalances();

  const metrics = {
    totalValue: data.perpsEquity + data.spotEquity,
    unrealizedPnl: data.perpsUnrealizedPnl + data.spotUnrealizedPnl,
    returnOnEquity: data.perpsReturnOnEquity + data.spotReturnOnEquity,
  };

  return (
    <div className="w-full py-3">
      <ConnectButton
        variant="ghost"
        className="size-fit p-0! text-white"
        disconnectedLabel="Total Value"
        onClick={openAccountModal}
      >
        <p className="text-xs font-medium">
          {address && formatAddress(address, 4)}
        </p>
        <ChevronDown />
      </ConnectButton>

      <div className="w-full flex justify-between items-center">
        <p className="text-2xl font-bold py-1.5">
          {formatNumber(metrics.totalValue, { style: "currency" })}
        </p>

        <Button
          size="sm"
          label="Add Funds"
          className="w-fit h-7 text-sm px-4"
          onClick={() =>
            useAccountTransactStore.getState().openAccountTransact("deposit")
          }
        />
      </div>

      <div className="flex items-center text-xs space-x-1">
        <span>Today&apos;s PNL</span>
        <span
          className={cn("text-white", {
            "text-buy": metrics.unrealizedPnl > 0,
            "text-sell": metrics.unrealizedPnl < 0,
          })}
        >
          {formatNumber(metrics.unrealizedPnl, {
            style: "currency",
            useSign: true,
          })}
          (
          {formatNumber(metrics.returnOnEquity / 100, {
            style: "percent",
            useSign: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          )
        </span>
      </div>
    </div>
  );
};

const AccountActions = () => {
  const haptic = useWebHaptics();

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-3 mt-2 mb-6">
      <AccountActionCard
        icon={<BanknoteArrowUp />}
        label="Deposit"
        onClick={() => {
          haptic.trigger("light");
          useAccountTransactStore.getState().openAccountTransact("deposit");
        }}
      />

      <AccountActionCard
        icon={<BanknoteArrowDown />}
        label="Withdraw"
        onClick={() => {
          haptic.trigger("light");
          useAccountTransactStore.getState().openAccountTransact("withdraw");
        }}
      />

      <AccountActionCard
        icon={<Send />}
        label="Transfer"
        onClick={() => {
          useAccountTransactStore.getState().openAccountTransact("transfer");
          haptic.trigger("light");
        }}
      />

      <SwapDrawer
        trigger={
          <AccountActionCard icon={<ArrowRightLeft />} label="Convert" />
        }
      />

      <PredictionMarketsDrawer
        trigger={<AccountActionCard icon={<Sparkles />} label="Predictions" />}
      />

      <AccountActionCard
        icon={<RefreshCcwDot />}
        label="Trade"
        onClick={() => {
          usePreferencesStore.getState().dispatch({ mobileViewTab: "trade" });
          haptic.trigger("light");
        }}
      />

      <PortfolioDrawer
        trigger={
          <AccountActionCard icon={<ChartNoAxesCombined />} label="Portfolio" />
        }
      />
    </div>
  );
};

const AccountActionCard = ({
  icon,
  label,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon: React.ReactNode;
  label: string;
}) => {
  const haptic = useWebHaptics();

  return (
    <Button
      variant="ghost"
      className="size-full p-0 text-white flex-col active:scale-95 transition-transform"
      {...props}
      onClick={(e) => {
        haptic.trigger("light");
        onClick?.(e);
      }}
    >
      <div className="bg-neutral-gray-600 rounded-xl p-3 [&>svg]:size-7">
        {icon}
      </div>
      <p className="text-3xs text-neutral-gray-400">{label}</p>
    </Button>
  );
};

const TOKENS_TABS = [
  { label: "Top Gainers", value: "gainers" },
  { label: "Top Losers", value: "losers" },
  { label: "24h Vol", value: "dailyVolume" },
  { label: "Market Cap", value: "marketCap" },
] as const;

const TOKENS_TYPE_TAB = [
  { label: "Spot", value: "spot" },
  { label: "Perps", value: "perps" },
] as const;

const TokensOverview = () => {
  const { selectTokenFromAssetInfo } = useSelectToken();
  const assets = useAssetsAndContexts();

  const haptic = useWebHaptics();

  const [activeTab, setActiveTab] =
    useState<(typeof TOKENS_TABS)[number]["value"]>("gainers");
  const [activeTypeTab, setActiveTypeTab] = useState<"spot" | "perps">("spot");

  const tokens = useMemo(() => {
    if (activeTypeTab === "spot") {
      return assets.spot;
    }
    return assets.perps;
  }, [activeTypeTab, assets]);

  const sortedTokens = useMemo(() => {
    switch (activeTab) {
      case "gainers":
        return tokens.sort((a, b) => {
          const changeInPercentageA = a.prevDayPx
            ? ((a.midPx - a.prevDayPx) / a.prevDayPx) * 100
            : 0;
          const changeInPercentageB = b.prevDayPx
            ? ((b.midPx - b.prevDayPx) / b.prevDayPx) * 100
            : 0;
          return changeInPercentageB - changeInPercentageA;
        });
      case "losers":
        return tokens
          .filter((t) => t.midPx)
          .sort((a, b) => {
            const changeInPercentageA = a.prevDayPx
              ? ((a.midPx - a.prevDayPx) / a.prevDayPx) * 100
              : 0;
            const changeInPercentageB = b.prevDayPx
              ? ((b.midPx - b.prevDayPx) / b.prevDayPx) * 100
              : 0;
            return changeInPercentageA - changeInPercentageB;
          });
      case "dailyVolume":
        return tokens.sort((a, b) => b.dayNtlVlm - a.dayNtlVlm);
      case "marketCap":
        return assets.spot.sort((a, b) => b.marketCap! - a.marketCap!);
      default:
        return tokens;
    }
  }, [activeTab, tokens]);

  const handleSelectToken = (token: Asset) => {
    selectTokenFromAssetInfo(token);
    usePreferencesStore.getState().dispatch({ mobileViewTab: "trade" });

    haptic.trigger("selection");
  };

  return (
    <div className="w-full mb-18">
      {/* <p className="text-sm font-semibold my-4">Markets</p> */}
      <div className="w-full min-h-90 bg-neutral-gray-600 rounded-lg p-3">
        <div className="flex items-center justify-between">
          {TOKENS_TABS.map((tab) => (
            <div
              key={tab.value}
              role="tab"
              className={cn("text-sm text-neutral-gray-400 font-semibold", {
                "text-white": activeTab === tab.value,
              })}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-x-3 py-2">
          {TOKENS_TYPE_TAB.map((tab) => {
            if (tab.value === "perps" && activeTab === "marketCap") return null;

            return (
              <div
                key={tab.value}
                role="tab"
                className={cn("text-xs text-neutral-gray-400 font-medium", {
                  "text-white":
                    activeTypeTab === tab.value ||
                    (tab.value === "spot" && activeTab === "marketCap"),
                })}
                onClick={() => setActiveTypeTab(tab.value)}
              >
                {tab.label}
              </div>
            );
          })}
        </div>

        <div className="w-full">
          <div className="grid grid-cols-3">
            <div className="text-3xs text-neutral-gray-400">
              <p>Symbol</p>
            </div>
            <div className="text-3xs text-neutral-gray-400 text-right">
              <p>Last Price</p>
            </div>
            <div className="text-3xs text-neutral-gray-400 text-right">
              <p>
                {activeTab === "marketCap"
                  ? "Cap"
                  : activeTab === "dailyVolume"
                    ? "Vol(USD)"
                    : "24h Change"}
              </p>
            </div>
          </div>
          <div className="w-full">
            {sortedTokens.slice(0, 8).map((token) => {
              const changeInPercentage = token.prevDayPx
                ? ((token.midPx - token.prevDayPx) / token.prevDayPx) * 100
                : 0;

              const priceDecimals = getPriceDecimals(
                token.midPx,
                token.szDecimals,
                token.isSpot,
              );

              return (
                <div
                  key={token.coin}
                  className="w-full grid grid-cols-3 py-2 last:pb-0 active:scale-98 transition-transform"
                  onClick={() => handleSelectToken(token)}
                >
                  <p className="text-xs font-medium">{token.symbol}</p>
                  <div className="text-xs text-right">
                    <p className="font-medium">
                      {formatPriceToDecimal(token.midPx, priceDecimals)}
                    </p>
                    <p className="text-neutral-gray-400 text-3xs">
                      {formatNumber(token.midPx, {
                        style: "currency",
                        useFallback: true,
                      })}
                    </p>
                  </div>

                  <div className="text-xs text-right">
                    <Visibility
                      visible={
                        activeTab !== "marketCap" && activeTab !== "dailyVolume"
                      }
                    >
                      <p
                        className={cn({
                          "text-buy": changeInPercentage > 0,
                          "text-sell": changeInPercentage < 0,
                        })}
                      >
                        {formatNumber(changeInPercentage / 100, {
                          style: "percent",
                          useSign: true,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </Visibility>

                    <Visibility visible={activeTab === "marketCap"}>
                      <p className="text-white font-medium">
                        {formatNumber(Number(token.marketCap || 0), {
                          style: "currency",
                          notation: "compact",
                          useFallback: true,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </Visibility>

                    <Visibility visible={activeTab === "dailyVolume"}>
                      <p className="text-white font-medium">
                        {formatNumber(token.dayNtlVlm, {
                          notation: "compact",
                          useFallback: true,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </Visibility>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTabView;
