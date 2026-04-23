import {
  AllDexsClearinghouseStateWsEvent,
  AllPerpMetasResponse,
  CandleSnapshotParameters,
  OrderParameters,
  SpotMetaResponse,
  SpotStateWsEvent,
} from "@nktkas/hyperliquid";

export type ChartType = "standard" | "tradingView" | "depth";

export type ChartView = "line" | "candlestick";

export type MobileViewTab = "home" | "markets" | "trade" | "account";

export type MarketAreaTabValue = "chart" | "orderbook" | "info";

export type CandleSnapshotInterval = CandleSnapshotParameters["interval"];

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
  value: CandleSnapshotInterval;
}

export type OrderType =
  | "limit"
  | "market"
  | "stopLimit"
  | "stopMarket"
  | "scale"
  | "twap";

export type OrderSide = "buy" | "sell";

export type OrderFormLimitOffsetType = "offset" | "pnl";

export type InstrumentType = "spot" | "perps";

export type ScaleDistribution = "equal" | "increasing" | "decreasing";

export type HLOrder = OrderParameters["orders"][number];

export type TimeInForce = Extract<HLOrder["t"], { limit: any }>["limit"]["tif"];

export type AssetMeta = {
  base: string;
  fullName?: string | null;
  assetId: number;
  szDecimals: number;
  pxDecimals: number | null;
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

  /** Reference price to be used for orders (mid price for spot, mark price for perps) */
  referencePx: number;
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

export type Asset = {
  isSpot: boolean;
  dex?: string | null;
  perpDexIndex?: number;
  /** Position of the asset in the universe array for spot and universe for perps */
  index: number;
  symbol: string;
  coin: string;
  base: string;
  quote: string;
  szDecimals: number;
  markPx: number;
  midPx: number;
  dayNtlVlm: number;
  dayBaseVlm: number;
  prevDayPx: number;
  funding: number | null;
  openInterest: number | null;
  oraclePx: number | null;
  maxLeverage: number | null;
  marketCap: number | null;
};

export type MarginTier = {
  lowerBound: number;
  upperBound?: number;
  maxLeverage: number;
  maintenanceDeduction: number;
};

export type AllPerpMetas = Array<
  AllPerpMetasResponse[number] & {
    dex: string;
    perpDexIndex: number;
  }
>;

export type SpotBalance = SpotStateWsEvent["spotState"]["balances"][number];

export type AllDexsClearinghouseState =
  AllDexsClearinghouseStateWsEvent["clearinghouseStates"][number][1];

export type AssetPosition = AllDexsClearinghouseState["assetPositions"][number];

export type Position = AssetPosition["position"] & {
  markPx: string;
  midPx: string;
  dex: string;
  base: string;
  quote: string;
  szDecimals: number;
  pxDecimals: number;
  assetId: number;
  isLong: boolean;
  tpPrice: string | null;
  slPrice: string | null;
};

export type OpenOrder = {
  timestamp: number;
  orderType: string;
  href: string;
  dex: string | null;
  base: string;
  coin: string;
  symbol: string;
  direction: string;
  side: string;
  sz: number;
  price: number;
  isSpot: boolean;
  triggerCondition: string;
  triggerPx: string;
  type: string;
  oid: number;
  cloid: `0x${string}` | null;
};

export type ActiveTwap = {
  twapId: number;
  coin: string;
  dex: string | null;
  base: string;
  symbol: string;
  href: string;
  averagePx: number;
  executedSz: number;
  minutes: number;
  randomize: boolean;
  reduceOnly: boolean;
  side: "B" | "A";
  sz: number;
  timestamp: number;
  isSpot: boolean;
  type: string;
};

export type SpotMetas = {
  spotMeta: SpotMetaResponse;
  /** Map of token name to universe index */
  tokenNamesToUniverseIndex: Map<string, Map<string, number>>;

  /** Map of spot name to token indices */
  spotNamesToTokens: Map<string, { baseToken: number; quoteToken: number }>;

  /** Map of token indices to spot id and spot name.
   *  The first map key is the base token index, the second map key is the quote token index.
   */
  tokenIndicesToSpot: Map<
    number,
    Map<number, { spotId: number; spotName: string }>
  >;
};

export type AccountActivity = {
  timestamp: number;
  status: string;
  action: string;
  source: string;
  destination: string;
  accountChange: number;
  fee: number;
  feeToken: string;
  asset: string;
  type: string;
  isIncoming: boolean;
};

export type PositionAction = "close" | "reverse" | "tpsl" | "margin";
