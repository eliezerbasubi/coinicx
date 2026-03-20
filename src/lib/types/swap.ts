export type SwapInputType = "buy" | "sell";

export type SwapSpotToken = {
  name: string;
  szDecimals: number;
  index: number;
  fullName: string | null;
  balance: string;
  balanceNtl?: string;
};

export type BookLevel = { px: string; sz: string; n: number };

export type SwapBook = {
  bids: BookLevel[];
  asks: BookLevel[];
  assetId: number;
};

export type SwapRoute = {
  path: string[];
  fromAmounts: number[];
  assetIds: number[];
  rate: number;
  toAmount: number;
  impact: number;
  insufficientLiquidity: boolean;
  fee: number;
  mids: number[];
};
