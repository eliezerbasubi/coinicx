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
