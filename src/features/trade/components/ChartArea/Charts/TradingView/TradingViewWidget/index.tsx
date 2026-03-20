// CREDITS:
// https://github.com/JorrinKievit/react-ts-tradingview-widgets/blob/main/src/components/AdvancedRealTimeChart.tsx

import React, { memo } from "react";

import { Locales, Studies, Timezone, WidgetFeatures } from "./types";
import Widget from "./Widget";

export type AdvancedRealTimeChartProps = {
  width?: number | string;
  height?: number | string;
  autosize?: boolean;
  symbol?: string;
  interval?:
    | "1"
    | "3"
    | "5"
    | "15"
    | "30"
    | "60"
    | "120"
    | "180"
    | "240"
    | "D"
    | "W";
  range?: "1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "12M" | "60M" | "ALL";
  timezone?: Timezone;
  theme?: "light" | "dark";
  style?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  locale?: Locales;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  withdateranges?: boolean;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  save_image?: boolean;
  details?: boolean;
  hotlist?: boolean;
  calendar?: boolean;
  show_popup_button?: boolean;
  popup_width?: string;
  popup_height?: string;
  watchlist?: string[];
  studies?: Studies[];
  disabled_features?: WidgetFeatures[];
  enabled_features?: WidgetFeatures[];
  container_id?: string;
  backgroundColor?: string;
  children?: never;
};

const AdvancedRealTimeChart = (props: AdvancedRealTimeChartProps) => {
  return (
    <Widget
      scriptHTML={{
        ...(!props.autosize
          ? { width: props.width ?? 980, height: props.height ?? 610 }
          : { width: "100%", height: "100%" }),
        ...(!props.range
          ? { interval: props.interval ?? "1" }
          : { range: props.range }),
        ...(props.show_popup_button && {
          show_popup_button: props.show_popup_button,
          popup_width: props.popup_width ?? "600",
          popup_height: props.popup_height ?? "400",
        }),
        timezone: props.timezone ?? "Etc/UTC",
        withdateranges: props.withdateranges ?? true,
        backgroundColor: "#181a20",
        toolbar_bg: "#181a20",
        gridColor: "rgba(242, 242, 242, 0.06)",
        theme: "dark",
        ...props,
      }}
      scriptSRC="https://s3.tradingview.com/tv.js"
      containerId={props.container_id}
      type="Widget"
    />
  );
};

export default memo(AdvancedRealTimeChart);
