export type DepthPoint = {
  price: number;
  size: number;
  cumulative: number;
};

export type DepthChartData = {
  bids: DepthPoint[];
  asks: DepthPoint[];
  midPrice: number;
  maxCumulative: number;
  minPrice: number;
  maxPrice: number;
};

export type PlotArea = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type DepthChartScale = {
  xScale: (price: number) => number;
  yScale: (cumulative: number) => number;
  xInverse: (pixelX: number) => number;
  plotArea: PlotArea;
  midX: number;
};

export type SideTooltipInfo = {
  visible: boolean;
  x: number;
  y: number;
  price: number;
  amount: number;
  cumulative: number;
  midPrice: number;
};

export type DualTooltipState = {
  bid: SideTooltipInfo;
  ask: SideTooltipInfo;
  activeSide: "bid" | "ask" | null;
};

export const EMPTY_SIDE_TOOLTIP: SideTooltipInfo = {
  visible: false,
  x: 0,
  y: 0,
  price: 0,
  amount: 0,
  cumulative: 0,
  midPrice: 0,
};
