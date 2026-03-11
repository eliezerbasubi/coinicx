import { useShallowPortfolioStore } from "../store";
import { usePortfolioData } from "./usePortfolioData";

const PERIOD_TO_PERPS_PERIOD = {
  day: "perpDay",
  week: "perpWeek",
  month: "perpMonth",
  allTime: "perpAllTime",
} as const;

export const usePortfolioMetrics = () => {
  const { data, isLoading } = usePortfolioData();

  const { period, portfolioType } = useShallowPortfolioStore((s) => ({
    period: s.period,
    portfolioType: s.portfolioType,
  }));

  const key = portfolioType === "all" ? period : PERIOD_TO_PERPS_PERIOD[period];

  const metrics = data.portfolio.get(key);

  return { metrics, period, portfolioType, data, isLoading };
};
