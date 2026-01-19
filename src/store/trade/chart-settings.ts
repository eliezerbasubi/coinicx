import { CandleSnapshotParameters } from "@nktkas/hyperliquid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChartSettingsState = {
  showQuickOrder: boolean;
  showPosition: boolean;
  showOrder: boolean;
  showHistoricalOrders: boolean;
  showLiquidationPrice: boolean;
  interval: CandleSnapshotParameters["interval"];
  bookmarkIntervals: CandleSnapshotParameters["interval"][];
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
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetBookmarkIntervals: () => set({ bookmarkIntervals }),
    }),
    { name: "user-chart-settings" },
  ),
);
