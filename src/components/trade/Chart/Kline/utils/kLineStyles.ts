import { DeepPartial, Styles } from "klinecharts";

export default {
  grid: {
    horizontal: {
      color: "#27282a",
      style: "solid",
    },
    vertical: {
      color: "#27282a",
      style: "solid",
    },
  },
  xAxis: {
    axisLine: {
      color: "#2b3139",
    },
    tickLine: {
      color: "#2b3139",
    },
    tickText: {
      family: "'IBM Plex Sans', sans-serif",
      color: "#b7bdc6",
      weight: "500",
    },
  },
  yAxis: {
    axisLine: {
      color: "#2b3139",
    },
    tickLine: {
      color: "#2b3139",
    },
    tickText: {
      family: "'IBM Plex Sans', sans-serif",
      color: "#b7bdc6",
      weight: "500",
    },
  },
  candle: {
    tooltip: {
      showRule: "none",
    },
    priceMark: {
      high: {
        textFamily: "'IBM Plex Sans', sans-serif",
        textWeight: "500",
      },
      low: {
        textFamily: "'IBM Plex Sans', sans-serif",
        textWeight: "500",
      },
      last: {
        text: {
          family: "'IBM Plex Sans', sans-serif",
          weight: "500",
        },
      },
    },
  },
  crosshair: {
    horizontal: {
      text: {
        family: "'IBM Plex Sans', sans-serif",
        weight: "500",
      },
    },
    vertical: {
      text: {
        family: "'IBM Plex Sans', sans-serif",
        weight: "500",
      },
    },
  },
  separator: {
    color: "#2b3139",
  },
  indicator: {
    tooltip: {
      showRule: "none",
    },
  },
} as DeepPartial<Styles>;
