import {
  ChartOptions,
  ColorType,
  CrosshairMode,
  DeepPartial,
  LineStyle,
} from "lightweight-charts";

const CHART_HEIGHT = 200;

export const BASE_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  height: CHART_HEIGHT,
  autoSize: true,
  crosshair: {
    mode: CrosshairMode.Normal,
    // Show a subtle vertical line from the marker down to the bottom
    vertLine: {
      visible: true,
      labelVisible: false,
      style: LineStyle.Dashed,
      width: 1,
      color: "#ffffff18",
    },
    // Hide horizontal line and price label on y-axis while hovering
    horzLine: {
      visible: false,
      labelVisible: false,
    },
  },
  timeScale: {
    borderColor: "#ffffff08",
    secondsVisible: false,
    timeVisible: true,
    visible: false,
  },
  rightPriceScale: {
    borderColor: "transparent",
    autoScale: true,
  },
  grid: {
    vertLines: { color: "transparent" },
    horzLines: { color: "#ffffff08", visible: false },
  },
  handleScroll: {
    vertTouchDrag: false,
    horzTouchDrag: false,
    pressedMouseMove: false,
    mouseWheel: false,
  },
  handleScale: {
    axisPressedMouseMove: false,
    axisDoubleClickReset: false,
    mouseWheel: false,
    pinch: false,
  },
  layout: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    attributionLogo: false,
    fontSize: 11,
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "#ffffff9e",
  },
};
