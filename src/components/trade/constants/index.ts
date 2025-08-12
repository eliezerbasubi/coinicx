import { ChartInterval, TradeType } from "@/types/trade";

export const defaultSpotAsset = {
  baseAsset: "BTC",
  quoteAsset: "USDC",
};

export const CHART_TIME_INTERVALS: Array<ChartInterval> = [
  { label: "Time", value: "1m", type: "minute", span: 1 },
  { label: "1s", value: "1s", type: "second", span: 1 },
  { label: "15m", value: "15m", type: "minute", span: 15 },
  { label: "1H", value: "1h", type: "hour", span: 1 },
  { label: "4H", value: "4h", type: "hour", span: 4 },
  { label: "1D", value: "1d", type: "day", span: 1 },
  { label: "1W", value: "1w", type: "week", span: 1 },
];

export const TRADE_TYPES: Array<{ label: string; value: TradeType }> = [
  { label: "Spot", value: "spot" },
  { label: "Cross", value: "cross" },
  { label: "Isolated", value: "isolated" },
  { label: "Grid", value: "grid" },
];
