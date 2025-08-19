export type ChartType = "standard" | "tradingView" | "depth";

export type ChartAreaTabValue =
  | "chart"
  | "orderbook"
  | "info"
  | "tradingData"
  | "tradingAnalysis";

export type ChartIntervalType =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month";

export interface ChartInterval {
  label: string;
  type: ChartIntervalType;
  span: number;
  value: string;
}

export type Kline = [
  number,
  `${number}`,
  `${number}`,
  `${number}`,
  `${number}`,
  `${number}`,
  number,
  `${number}`,
  number,
  `${number}`,
  `${number}`,
  `${number}`,
];

export type OrderType =
  | "limit"
  | "market"
  | "stopLimit"
  | "stopMarket"
  | "trailingStop"
  | "oco"
  | "twap";

export type OrderSide = "buy" | "sell";

export type OrderFormLimitOffsetType = "offset" | "pnl";

export type TradeType = "spot" | "isolated" | "cross" | "grid";

export type TradeMarketTicker = {
  an: string; // Full name of the base asset (e.g. "Bitcoin")
  qn: string; // Full name of the quote asset (e.g. "TetherUS")
  o: number; // Opening price of the pair for the current trading session (e.g. "0.0291")
  h: number; // Highest price during the current trading session (e.g. "0.0295")
  l: number; // Lowest price during the current trading session (e.g. "0.0277")
  c: number; // Closing price (most recent market price) (e.g. "0.0285")
  v: number; // 24-hour trading volume of the base asset (ACA) (e.g. "38715305.10000000")
  qv: number; // 24-hour trading volume in terms of the quote asset (USDT) (e.g. "1105170.905629")
  as: number; // The total amount of the base asset (ACA) traded in the last 24 hours (e.g. "38715305.1")
  cs: number; // Circulating supply of the base asset (ACA) (e.g. 1138749994)
};
