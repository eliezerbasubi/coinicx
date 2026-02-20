import { CandleSnapshotParameters, OrderParameters } from "@nktkas/hyperliquid";

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
  listed?: boolean;
  value: CandleSnapshotParameters["interval"];
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
  | "scale"
  | "twap";

export type OrderSide = "buy" | "sell";

export type OrderFormLimitOffsetType = "offset" | "pnl";

export type TradeType = "spot" | "isolated" | "cross" | "grid";

export type InstrumentType = "spot" | "perps";

export type HLOrder = OrderParameters["orders"][number];

export type TimeInForce = Extract<HLOrder["t"], { limit: any }>["limit"]["tif"];

export type AssetMeta = {
  base: string;
  fullName?: string | null;
  assetId: number;
  szDecimals: number;
  maxLeverage: number;
  tokenId: `0x${string}` | null;
  /** Position of the asset in the tokens array for spot and universe for perps */
  index: number;
  /** Token index in universe for spot and universe name for perps */
  coin: string;
  quote: string;
  symbol: string;
  dex: string | null;
  perpDexIndex?: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
  isCanonical?: boolean;
  marginMode?: "strictIsolated" | "noCross";
};

export type AssetCxt = {
  dayNtlVlm: number;
  dayBaseVlm: number;
  openInterest: number | null;
  marketCap: number | null;
  funding: number | null;
  prevDayPx: number;
  midPx: number;
  markPx: number;
  oraclePx: number | null;
};

export type AllAssetsMetas = {
  name: string;
  szDecimals: number;
  coin: string;
  dex: string | null;
  isCanonical?: boolean;
  maxLeverage: number;
  quote: string;
  symbol: string;
};

export type MetaAndAssetCtx = {
  meta: AssetMeta;
  ctx: AssetCxt;
  isSpot: boolean;
};

export type Order = {
  assetId: number;
  side: OrderSide;
  type: OrderType | "stopLoss" | "takeProfit";
  price: string | number;
  size: string;
  reduceOnly?: boolean;
  timeInForce?: TimeInForce;
  triggerPrice?: string;
  isMarket?: boolean;
  clientOrderId?: string;
};

export type MarginTier = {
  lowerBound: number;
  upperBound?: number;
  maxLeverage: number;
  maintenanceDeduction: number;
};
