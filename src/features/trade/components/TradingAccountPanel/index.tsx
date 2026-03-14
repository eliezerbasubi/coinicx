import { useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/store/trade/user-preferences";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";

import Balances from "./Balances";
import DepositsAndWithdrawals from "./DepositsAndWithdrawals";
import FundingHistory from "./FundingHistory";
import OpenOrders from "./OpenOrders";
import OrderHistory from "./OrderHistory";
import Positions from "./Positions";
import TradeHistory from "./TradeHistory";
import Twaps from "./TWAPs";

type TabValue =
  | "balances"
  | "positions"
  | "openOrders"
  | "twap"
  | "orderHistory"
  | "tradeHistory"
  | "fundingHistory"
  | "depositAndWithdrawals";

type Tab = { label: string; value: TabValue; counter?: string };

const TABS: Tab[] = [
  { label: "Balances", value: "balances" },
  { label: "Positions", value: "positions", counter: "positionsCount" },
  { label: "Open Orders", value: "openOrders", counter: "openOrdersCount" },
  { label: "TWAP", value: "twap", counter: "twapsCount" },
  { label: "Order History", value: "orderHistory" },
  { label: "Trade History", value: "tradeHistory" },
  { label: "Funding History", value: "fundingHistory" },
  { label: "Deposits & Withdrawals", value: "depositAndWithdrawals" },
];

type Props = {
  defaultTab?: string;
  className?: string;
  excludeTabs?: TabValue[];
};

const TradingAccountPanel = ({ defaultTab, className, excludeTabs }: Props) => {
  const activeTab = useShallowPreferencesStore((s) => s.activeTab);

  const counters = useShallowUserTradeStore((s) => ({
    openOrdersCount: s.openOrders.length,
    positionsCount: s.allDexsClearinghouseState?.assetPositions.length || 0,
    twapsCount: s.twapStates.twaps.length,
  }));

  // Set default value if the excluded tabs include the current tab
  useEffect(() => {
    if (excludeTabs && excludeTabs.includes(activeTab as TabValue)) {
      usePreferencesStore
        .getState()
        .dispatch({ activeTab: defaultTab || TABS[0].value });
    }
  }, [activeTab, defaultTab, excludeTabs]);

  return (
    <div
      className={cn(
        "w-full min-h-85 md:max-h-85 overflow-hidden bg-primary-dark",
        className,
      )}
    >
      <Tabs
        defaultValue={defaultTab}
        value={activeTab}
        onValueChange={(value) =>
          usePreferencesStore.getState().dispatch({ activeTab: value })
        }
        className="h-full gap-0"
      >
        <TabsList
          variant="line"
          className="w-full px-4 shrink-0 space-x-0 md:space-x-4 justify-start"
        >
          {TABS.map((tab) => {
            if (excludeTabs && excludeTabs.includes(tab.value)) return null;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit flex-0 text-xs font-medium"
              >
                {tab.label}
                {tab.counter &&
                  !!counters[tab.counter as keyof typeof counters] &&
                  ` (${counters[tab.counter as keyof typeof counters]})`}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <AuthenticatedContent>
          <TabsContent
            value="balances"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <Balances />
          </TabsContent>
          <TabsContent
            value="positions"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <Positions />
          </TabsContent>
          <TabsContent
            value="openOrders"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <OpenOrders />
          </TabsContent>
          <TabsContent
            value="twap"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <Twaps />
          </TabsContent>
          <TabsContent
            value="orderHistory"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <OrderHistory />
          </TabsContent>
          <TabsContent
            value="tradeHistory"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <TradeHistory />
          </TabsContent>
          <TabsContent
            value="fundingHistory"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <FundingHistory />
          </TabsContent>
          <TabsContent
            value="depositAndWithdrawals"
            className="overflow-auto [&::-webkit-scrollbar]:h-1"
          >
            <DepositsAndWithdrawals />
          </TabsContent>
        </AuthenticatedContent>
      </Tabs>
    </div>
  );
};

const AuthenticatedContent = ({ children }: { children: React.ReactNode }) => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <div className="h-full min-h-20 flex items-center justify-center">
      <p className="text-sm">
        Please &nbsp;
        <span
          role="button"
          className="text-primary cursor-pointer"
          onClick={openConnectModal}
        >
          connect
        </span>
        &nbsp; your wallet first.
      </p>
    </div>
  );
};

export default TradingAccountPanel;
