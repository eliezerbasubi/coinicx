import { CandleSnapshotParameters } from "@nktkas/hyperliquid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { ChartType } from "@/types/trade";

type ChartSettingsState = {
  showQuickOrder: boolean;
  showPosition: boolean;
  showOrder: boolean;
  showHistoricalOrders: boolean;
  showLiquidationPrice: boolean;
  interval: CandleSnapshotParameters["interval"];
  bookmarkIntervals: CandleSnapshotParameters["interval"][];
  chartType: ChartType;
};

const bookmarkIntervals: Array<CandleSnapshotParameters["interval"]> = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
  "1w",
];

type ChartSettingsActions = {
  setSettings: (settings: Partial<ChartSettingsState>) => void;
  resetBookmarkIntervals: () => void;
};

type ChartSettingsStore = ChartSettingsState & ChartSettingsActions;

export const useChartSettingsStore = create<ChartSettingsStore>()(
  persist(
    (set) => ({
      showQuickOrder: true,
      showPosition: true,
      showOrder: false,
      showHistoricalOrders: false,
      showLiquidationPrice: false,
      bookmarkIntervals,
      interval: "1h",
      chartType: "standard",
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetBookmarkIntervals: () => set({ bookmarkIntervals }),
    }),
    { name: "user-chart-settings" },
  ),
);

export const useShallowChartSettingsStore = <T>(
  selector: (state: ChartSettingsStore) => T,
) => {
  return useChartSettingsStore(useShallow(selector));
};
