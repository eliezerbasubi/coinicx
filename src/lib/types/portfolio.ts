export type PortfolioChartTab = "accountValue" | "pnl";

export type PortfolioPeriod = "day" | "week" | "month" | "allTime";

export type PortfolioPeriodKey =
  | PortfolioPeriod
  | "perpDay"
  | "perpWeek"
  | "perpMonth"
  | "perpAllTime";

/** All type includes perps, spot and vaults. */
export type PortfolioType = "all" | "perps";
