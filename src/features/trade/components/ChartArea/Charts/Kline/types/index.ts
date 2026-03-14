import { Indicator, KLineData } from "klinecharts";

export type KLineSource = keyof Pick<
  KLineData,
  "open" | "high" | "low" | "close"
>;

export type IndicatorCalcFn = (
  kLineDataList: KLineData[],
  indicator: Indicator,
) => Array<unknown>;

export type KlineIndicatorCalcParam = {
  period: number;
  lineWidth: number;
  color: string;
  source: KLineSource;
  visible: boolean;
};

export type KlineIndicator = {
  name: string;
  showSeries: boolean;
  params: Array<KlineIndicatorCalcParam>;
};

export type KlineIndicatorLayout = {
  indicators: KlineIndicator[];
  type: string;
};

export type KlineIndicatorEventData = Record<string, Record<string, number>>;

export type CrosshairEventData = {
  crosshair: {
    paneId: string;
    kLineData: KLineData;
    dataIndex: number;
  };
  indicatorData: {
    [paneId: string]: KlineIndicatorEventData;
  };
};

export type KLineStreamData = {
  e: "kline"; // Event Type - Always "kline" for this stream
  E: number; // Timestamp in milliseconds for when the event was generated
  s: string; // Trading pair symbol (e.g., BTCUSDC)
  k: {
    t: number; // Start time of the candlestick in milliseconds
    T: number; // End time of the candlestick in milliseconds.
    s: string; // Symbol
    i: string; // Interval for the kline (e.g., "1m" for 1 minute).
    f: number; // ID of the first trade in this candlestick
    L: number; // ID of the last trade in this candlestick
    o: `${number}`; // Price at which the first trade occurred in this candle
    c: `${number}`; // Price at which the last trade occurred in this candle
    h: `${number}`; // Highest trade price during this candle
    l: `${number}`; // Lowest trade price during this candle
    v: `${number}`; // Total volume traded of the base asset (e.g., BTC)
    n: number; // Number of trades executed during this candle
    x: false; // true if the candlestick is closed (final), false if it's still being updated.
    q: `${number}`; // Total volume traded of the quote asset (e.g., USDC)
    V: `${number}`; // Volume of base asset bought by takers
    Q: `${number}`; // Volume of quote asset spent by takers
    B: `${number}`; // Reserved field, currently ignored
  };
};
