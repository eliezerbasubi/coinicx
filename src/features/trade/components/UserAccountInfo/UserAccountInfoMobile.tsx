import { useMemo, useReducer } from "react";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { User } from "lucide-react";
import { useAccount } from "wagmi";
import { useWebHaptics } from "web-haptics/react";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import AccountActions from "@/components/common/AccountActions";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortfolioDrawer from "@/features/portfolio/components/PortfolioDrawer";
import { useAccountBalances } from "@/features/trade/hooks/useAccountBalances";

import TradingAccountActivityDrawer from "../TradingAccountPanel/TradingAccountActivity/TradingAccountActivityDrawer";
import AccountMarginItems from "./AccountMarginItems";
import PerpEquityItems from "./PerpEquityItems";

const ACCOUNT_INFO_TABS = [
  { label: "Overview", value: "overview" },
  {
    label: "Spot",
    value: "spot",
  },
  {
    label: "Perps",
    value: "perps",
  },
] as const;

type Tab = (typeof ACCOUNT_INFO_TABS)[number]["value"];

type State = {
  currentTab: Tab;
  infoTab: "assets" | "accounts";
};

const UserAccountInfoMobile = () => {
  const [state, dispatch] = useReducer(
    (prev: State, next: Partial<State>) => ({ ...prev, ...next }),
    { currentTab: "overview", infoTab: "assets" },
  );

  return (
    <div className="w-full bg-primary-dark">
      <div className="sticky top-0 z-10 standalone:pt-safe-top bg-primary-dark">
        <div className="w-full h-11 flex justify-between items-center px-4">
          <div className="flex items-center gap-x-3">
            {ACCOUNT_INFO_TABS.map((tab) => (
              <div
                key={tab.value}
                className={cn("text-neutral-gray-400 font-semibold", {
                  "text-white": tab.value === state.currentTab,
                })}
                onClick={() =>
                  dispatch({
                    currentTab: tab.value,
                    infoTab:
                      tab.value !== "overview" ? "assets" : state.infoTab,
                  })
                }
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-x-2">
            <OpenAccountButton />
            <TradingAccountActivityDrawer />
          </div>
        </div>
      </div>

      <div className="w-full px-4">
        <AccountValueOverview tab={state.currentTab} />
        <Visibility visible={state.currentTab === "perps"}>
          <PerpsDetails />
        </Visibility>

        <AccountActions primary="deposit" />
        <PortfolioDrawer />
      </div>

      <Tabs
        className="w-full mt-4"
        value={state.infoTab}
        defaultValue="assets"
        onValueChange={(value) =>
          dispatch({ infoTab: value as State["infoTab"] })
        }
      >
        <TabsList variant="line" className="w-full justify-start px-4">
          <TabsTrigger value="assets" className="flex-0 text-xs">
            {state.currentTab === "overview" ? "Assets" : "Balances"}
          </TabsTrigger>
          <Visibility visible={state.currentTab === "overview"}>
            <TabsTrigger value="accounts" className="flex-0 text-xs">
              Accounts
            </TabsTrigger>
          </Visibility>
        </TabsList>
        <TabsContent value="assets">
          <Assets tab={state.currentTab} />
        </TabsContent>
        <Visibility visible={state.currentTab === "overview"}>
          <TabsContent value="accounts" className="px-4 py-2">
            <Accounts />
          </TabsContent>
        </Visibility>
      </Tabs>
    </div>
  );
};

const AccountValueOverview = ({ tab }: { tab: Tab }) => {
  const data = useAccountBalances();

  const metrics =
    tab === "overview"
      ? {
          totalValue: data.perpsEquity + data.spotEquity,
          unrealizedPnl: data.perpsUnrealizedPnl + data.spotUnrealizedPnl,
          returnOnEquity: data.perpsReturnOnEquity + data.spotReturnOnEquity,
        }
      : tab === "perps"
        ? {
            totalValue: data.perpsEquity,
            unrealizedPnl: data.perpsUnrealizedPnl,
            returnOnEquity: data.perpsReturnOnEquity,
          }
        : {
            totalValue: data.spotEquity,
            unrealizedPnl: data.spotUnrealizedPnl,
            returnOnEquity: data.spotReturnOnEquity,
          };

  return (
    <div className="w-full mb-3">
      <p className="text-xs text-neutral-gray-400 font-medium">Total Value</p>
      <p className="text-2xl font-semibold py-1.5">
        {formatNumber(metrics.totalValue, { style: "currency" })}
      </p>

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

const OpenAccountButton = () => {
  const { address } = useAccount();
  const { openAccountModal } = useAccountModal();
  const { openConnectModal } = useConnectModal();
  const haptic = useWebHaptics();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="p-0 size-4.5 text-white"
      onClick={() => {
        haptic.trigger("light");

        if (address) {
          openAccountModal?.();
        } else {
          openConnectModal?.();
        }
      }}
    >
      <User className="size-full" />
    </Button>
  );
};

const Assets = ({ tab }: { tab: Tab }) => {
  const { balances: rawBalances } = useAccountBalances();

  const balances = useMemo(() => {
    if (tab !== "overview") return rawBalances;

    let usdcMerged: any = null;
    let usdcCount = 0;
    const result = [];

    for (const b of rawBalances) {
      if (b.coin === "USDC") {
        usdcCount++;

        if (!usdcMerged) {
          usdcMerged = {
            ...b,
            totalBalance: 0,
            availableBalance: 0,
            usdValue: 0,
          };
        }

        usdcMerged.totalBalance += b.totalBalance;
        usdcMerged.availableBalance += b.availableBalance;
        usdcMerged.usdValue += b.usdValue;
      } else {
        result.push(b);
      }
    }

    if (usdcCount <= 1) return rawBalances;

    return [usdcMerged!, ...result];
  }, [rawBalances, tab]);

  return (
    <div className="w-full">
      {balances.map((balance) => {
        if (tab === "spot" && !balance.isSpot) return null;
        if (tab === "perps" && balance.isSpot) return null;

        return (
          <div
            key={balance.coin + Number(balance.isSpot)}
            className="flex gap-2 items-center py-1 px-4 last:pb-0"
          >
            <div className="flex-1 flex items-center gap-2">
              <div className="size-6 relative">
                <TokenImage
                  key={balance.coin}
                  name={balance.coin}
                  instrumentType="perps"
                  className="size-6 rounded-full overflow-hidden"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="text-white font-medium flex items-center">
                  {balance.coin}
                </p>
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-white text-sm font-medium">
                {formatNumber(Number(balance.totalBalance), {
                  minimumFractionDigits: 2,
                  roundingMode: "trunc",
                })}
              </p>
              <p className="text-xs text-neutral-gray-400 font-medium">
                {formatNumber(balance.usdValue, {
                  minimumFractionDigits: 2,
                  style: "currency",
                })}
              </p>
            </div>
          </div>
        );
      })}

      {/* User has no spot balances. Show empty state.
       * Perps balance is present by default, so the balances array will be of size 1.
       */}
      <Visibility
        visible={
          tab === "spot" &&
          (!balances.length ||
            (balances.length === 1 && !balances.at(0)?.isSpot))
        }
      >
        <div className="h-30 flex flex-col items-center justify-center gap-y-3">
          You have no balances yet
          <Button
            variant="secondary"
            size="sm"
            className="w-fit h-7 text-neutral-gray-100"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("deposit")
            }
          >
            Deposit
          </Button>
        </div>
      </Visibility>
    </div>
  );
};

const Accounts = () => {
  const { spotEquity, perpsEquity } = useAccountBalances();

  return (
    <div className="w-full space-y-3">
      {[
        { label: "Perps", value: perpsEquity },
        { label: "Spot", value: spotEquity },
      ]
        .sort((a, b) => b.value - a.value)
        .map((account) => (
          <div
            key={account.label}
            className="flex items-center justify-between"
          >
            <p className="text-xs text-neutral-gray-400 font-medium">
              {account.label}
            </p>
            <p className="text-xs text-white font-medium">
              {formatNumber(account.value, {
                style: "currency",
              })}
            </p>
          </div>
        ))}

      <p className="text-3xs text-neutral-gray-400 mt-8 text-center">
        Showing trading accounts only. Open portfolio for more details.
      </p>
    </div>
  );
};

const PerpsDetails = () => {
  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-2 gap-2 py-2">
        <PerpEquityItems className="block space-y-1" />
        <AccountMarginItems className="block space-y-1" />
      </div>
    </div>
  );
};

export default UserAccountInfoMobile;
