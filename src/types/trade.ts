export type ChartType = "standard" | "tradingView" | "depth";

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

export type OrderFormLimitOffsetType = "offset" | "pnl";

export type TradeType = "spot" | "isolated" | "cross" | "grid";
