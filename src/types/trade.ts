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
