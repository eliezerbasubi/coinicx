import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export type ChartTab = "accountValue" | "pnl";
export type PortfolioPeriod = "day" | "week" | "month" | "allTime";
export type PortfolioPeriodKey =
  | PortfolioPeriod
  | "perpDay"
  | "perpWeek"
  | "perpMonth"
  | "perpAllTime";

/** All type includes perps, spot and vaults. */
export type PortfolioType = "all" | "perps";

type PortfolioStore = {
  activeChartTab: ChartTab;
  period: PortfolioPeriod;
  /** All type includes perps, spot and vaults. */
  portfolioType: PortfolioType;
  setActiveChart: (value: ChartTab) => void;
  setPeriod: (period: PortfolioPeriod) => void;
  setPortfolioType: (portfolioType: PortfolioType) => void;
  getPeriodKey: () => PortfolioPeriodKey;
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      activeChartTab: "pnl",
      period: "month",
      portfolioType: "all",
      setActiveChart(activeChartTab) {
        set({ activeChartTab });
      },
      setPeriod(period) {
        set({ period });
      },
      setPortfolioType(portfolioType) {
        set({ portfolioType });
      },
      getPeriodKey() {
        const { period, portfolioType } = get();

        if (portfolioType === "all") return period;
        return PERIOD_TO_PERPS_PERIOD[period];
      },
    }),
    { name: "portfolio-storage" },
  ),
);

const PERIOD_TO_PERPS_PERIOD: Record<PortfolioPeriod, PortfolioPeriodKey> = {
  day: "perpDay",
  week: "perpWeek",
  month: "perpMonth",
  allTime: "perpAllTime",
};

export const useShallowPortfolioStore = <T>(
  selector: (state: PortfolioStore) => T,
) => {
  return usePortfolioStore(useShallow(selector));
};
