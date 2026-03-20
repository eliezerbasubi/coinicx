import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import {
  PortfolioChartTab,
  PortfolioPeriod,
  PortfolioType,
} from "@/lib/types/portfolio";
import { MarketAreaTabValue, MobileViewTab } from "@/lib/types/trade";

type PreferencesState = {
  portfolioChartTab: PortfolioChartTab;
  portfolioPeriod: PortfolioPeriod;
  portfolioType: PortfolioType;
  mobileViewTab: MobileViewTab;
  activeTab: string;
  twapActiveTab: string;
  marketActiveTab: MarketAreaTabValue;
};

type UserPreferencesActions = {
  dispatch: (state: Partial<PreferencesState>) => void;
};

type PreferencesStore = PreferencesState & UserPreferencesActions;

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      portfolioChartTab: "pnl",
      portfolioPeriod: "month",
      portfolioType: "all",
      mobileViewTab: "trade",
      activeTab: "balances",
      twapActiveTab: "active",
      marketActiveTab: "chart",
      dispatch(state) {
        set({ ...state });
      },
    }),
    { name: "user-preferences" },
  ),
);

export const useShallowPreferencesStore = <T>(
  selector: (state: PreferencesStore) => T,
) => {
  return usePreferencesStore(useShallow(selector));
};
