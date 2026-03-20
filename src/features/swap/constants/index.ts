export const DEFAULT_SELL_ASSET = {
  name: "USDC",
  coin: "PURR/USDC",
  szDecimals: 8,
  index: 0,
  fullName: null,
  balance: "0",
} as const;

export const DEFAULT_QUOTE_ASSET_NAMES = [
  "USDC",
  "USDT0",
  "USDT",
  "USDE",
  "USDEEE",
  "USDH",
];

export const MAX_SLIPPAGE = 50;
export const MIN_SLIPPAGE = 0.1;
export const MIN_HIGH_SLIPPAGE = 10;

export const DIRECT_SWAP_FEE = 0.1;
export const ROUTED_SWAP_FEE = 0.2;

export const SWAP_POPULAR_TOKENS = ["BTC", "ETH", "SOL", "PUMP", "HYPE"];
