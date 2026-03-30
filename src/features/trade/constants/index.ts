import { ChartInterval, TradeType } from "@/lib/types/trade";

export const DEFAULT_SPOT_ASSETS = {
  base: "HYPE",
  quote: "USDC",
};

export const DEFAULT_PERPS_ASSETS = {
  base: "BTC",
  quote: "USDC",
};

export const MAX_PERPS_DECIMALS = 6;
export const MAX_SPOT_DECIMALS = 8;
export const MAX_SIGNIFICANT_DECIMALS = 5;

export const DEFAULT_ORDER_MAX_SLIPPAGE = 0.08; // 8%
export const DEFAULT_TPSL_ORDER_MAX_SLIPPAGE = 0.1; // 10%

export const PRIMARY_SUPPORTED_DEXS = ["", "xyz", "flx", "vtnl", "hyna"];

export const CHART_TIME_INTERVALS: Array<ChartInterval> = [
  { label: "1m", value: "1m", type: "minute", span: 1, listed: true },
  { label: "3m", value: "3m", type: "minute", span: 3 },
  { label: "5m", value: "5m", type: "minute", span: 5, listed: true },
  { label: "15m", value: "15m", type: "minute", span: 15, listed: true },
  { label: "1H", value: "1h", type: "hour", span: 1, listed: true },
  { label: "2H", value: "2h", type: "hour", span: 2 },
  { label: "4H", value: "4h", type: "hour", span: 4, listed: true },
  { label: "8H", value: "8h", type: "hour", span: 8 },
  { label: "12H", value: "12h", type: "hour", span: 12 },
  { label: "1D", value: "1d", type: "day", span: 1, listed: true },
  { label: "3D", value: "3d", type: "day", span: 3 },
  { label: "1W", value: "1w", type: "week", span: 1, listed: true },
  { label: "1M", value: "1M", type: "month", span: 1 },
];

export const DEFAULT_CHART_INTERVAL: ChartInterval = {
  label: "1H",
  value: "1h",
  type: "hour",
  span: 1,
};

export const TRADE_TYPES: Array<{ label: string; value: TradeType }> = [
  { label: "Spot", value: "spot" },
  { label: "Cross", value: "cross" },
  { label: "Isolated", value: "isolated" },
  { label: "Grid", value: "grid" },
];

export const ORDER_FORM_SIDES = {
  buy: {
    spot: "Buy",
    perp: "Long",
  },
  sell: {
    spot: "Sell",
    perp: "Short",
  },
} as const;
