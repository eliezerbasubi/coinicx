import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";

import Balances from "./Balances";
import FundingHistory from "./FundingHistory";
import OpenOrders from "./OpenOrders";
import OrderHistory from "./OrderHistory";
import Positions from "./Positions";
import { useInfoSectionStore, useShallowInfoSectionStore } from "./store";
import TradeHistory from "./TradeHistory";
import Twaps from "./TWAPs";

const TABS = [
  { label: "Balances", value: "balances" },
  { label: "Positions", value: "positions", counter: "positionsCount" },
  { label: "Open Orders", value: "openOrders", counter: "openOrdersCount" },
  { label: "TWAP", value: "twap", counter: "twapsCount" },
  { label: "Order History", value: "orderHistory" },
  { label: "Trade History", value: "tradeHistory" },
  { label: "Funding History", value: "fundingHistory" },
];

const TradeUserInfo = () => {
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");
  const activeTab = useShallowInfoSectionStore((s) => s.activeTab);

  const counters = useShallowUserTradeStore((s) => ({
    openOrdersCount: s.openOrders.length,
    positionsCount: s.clearinghouseState?.assetPositions.length || 0,
    twapsCount: s.twapStates.twaps.length,
  }));

  return (
    <div className="w-full md:h-85 overflow-hidden bg-primary-dark md:rounded-md">
      <Tabs
        defaultValue={isPerps ? "positions" : "balances"}
        value={activeTab}
        onValueChange={(value) =>
          useInfoSectionStore.setState({ activeTab: value })
        }
        className="h-full gap-0"
      >
        <div className="w-full border-b border-neutral-gray-200 overflow-x-auto no-scrollbars">
          <TabsList
            variant="line"
            className="h-11! px-4 pt-0 justify-start md:justify-center shrink-0 space-x-0 md:space-x-4"
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-fit text-xs font-medium"
              >
                {tab.label}
                {tab.counter &&
                  ` (${counters[tab.counter as keyof typeof counters]})`}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <AuthenticatedContent>
          <TabsContent value="balances" className="overflow-auto">
            <Balances />
          </TabsContent>
          <TabsContent value="positions" className="overflow-auto">
            <Positions />
          </TabsContent>
          <TabsContent value="openOrders" className="overflow-auto">
            <OpenOrders />
          </TabsContent>
          <TabsContent value="twap" className="overflow-auto">
            <Twaps />
          </TabsContent>
          <TabsContent value="orderHistory" className="overflow-auto">
            <OrderHistory />
          </TabsContent>
          <TabsContent value="tradeHistory" className="overflow-auto">
            <TradeHistory />
          </TabsContent>
          <TabsContent value="fundingHistory" className="overflow-auto">
            <FundingHistory />
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
    <div className="h-full flex items-center justify-center">
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

export default TradeUserInfo;
