import { ChartInterval, TradeType } from "@/types/trade";

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

export const DEFAULT_ORDER_MAX_SLIPPAGE = 0.08;

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

export const COINICX_BUILDER_SETTINGS = {
  b: "0xCf7e559aDA0E979BbbFF1B263Ea60185a9A594e4",
  f: 40,
} as const;

export const COINICX_AGENT_SETTINGS = {
  agentName: "CoinicX",
  agentAddress: "0x7344fe7714C7a16314ea35DdB1004C7574347D6E",
  pk: "0xab6d6cd084b1c897a44f7525476f612d234ec892bed4537f8039532cd491e09e",
} as const;
