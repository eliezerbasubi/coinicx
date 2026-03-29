import { Activity } from "react";

import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/lib/store/trade/user-preferences";
import BottomNavigationBar from "@/components/common/BottomNavigationBar";

import AccountTabView from "./AccountTabView";
import HomeTabView from "./HomeTabView";
import MarketTabView from "./MarketTabView";
import TradeTabView from "./TradeTabView";

const TradingMobileLayout = () => {
  const activeTab = useShallowPreferencesStore((s) => s.mobileViewTab);

  return (
    <div className="w-full">
      <Activity mode={activeTab === "home" ? "visible" : "hidden"}>
        <HomeTabView />
      </Activity>

      <Activity mode={activeTab === "markets" ? "visible" : "hidden"}>
        <MarketTabView />
      </Activity>

      <Activity mode={activeTab === "trade" ? "visible" : "hidden"}>
        <TradeTabView />
      </Activity>

      <Activity mode={activeTab === "account" ? "visible" : "hidden"}>
        <AccountTabView />
      </Activity>

      <BottomNavigationBar
        value={activeTab}
        onValueChange={(value) =>
          usePreferencesStore.getState().dispatch({ mobileViewTab: value })
        }
      />
    </div>
  );
};

export default TradingMobileLayout;
