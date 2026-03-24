import { useEffect, useRef } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/lib/store/trade/user-preferences";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticatedContent from "@/features/trade/components/AuthenticatedContent";

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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const counters = useShallowUserTradeStore((s) => ({
    openOrdersCount: s.openOrders.length,
    positionsCount: s.allDexsClearinghouseState?.assetPositions.length || 0,
    twapsCount: s.twapStates.twaps.length,
  }));

  const scrollTabIntoView = (element: Element | null) => {
    const container = containerRef.current;

    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = element.getBoundingClientRect();

      if (tabRect.right > containerRect.right) {
        container.scrollBy({
          left: tabRect.right - containerRect.right + 6, // 6px padding
          behavior: "smooth",
        });
      }
    }
  };

  // Set default value if the excluded tabs include the current tab
  // Scroll the current tab into view
  useEffect(() => {
    let currentTab = usePreferencesStore.getState().activeTab;

    if (excludeTabs && excludeTabs.includes(currentTab as TabValue)) {
      currentTab = defaultTab || TABS[0].value;

      usePreferencesStore.getState().dispatch({ activeTab: currentTab });
    }

    const tabElement = tabRefs.current[currentTab];

    scrollTabIntoView(tabElement);
  }, []);

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
          ref={containerRef}
          variant="line"
          className="w-full px-2 md:px-4 shrink-0 space-x-0 md:space-x-4 justify-start scroll-smooth"
        >
          {TABS.map((tab) => {
            if (excludeTabs && excludeTabs.includes(tab.value)) return null;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit flex-0 text-xs font-medium"
                ref={(element) => {
                  if (element) {
                    tabRefs.current[tab.value] = element;
                  }
                }}
                onClick={(event) => {
                  const tabElement = event.currentTarget.nextElementSibling;

                  if (tabElement) {
                    scrollTabIntoView(tabElement);
                  }
                }}
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

export default TradingAccountPanel;
