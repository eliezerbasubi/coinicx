export type MarketType = "buy" | "sell";
export type AssetType = "fiat" | "crypto";
export type GraphPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface ICurrency {
  id: string;
  assetCode: string;
  assetName: string;
  assetLogo: string;
  symbol: string;
}

export interface IExchangeRate {
  name: string;
  unit: string;
  value: number;
  type: AssetType;
}

export interface IGetQuotesParams {
  id: string;
  interval: string;
  count: number;
  time_start: number;
}

export interface ICryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
}
