import { useCallback, useEffect, useMemo, useRef } from "react";
import { CandleSnapshotResponse } from "@nktkas/hyperliquid";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  LineSeries,
  MouseEventParams,
  Time,
} from "lightweight-charts";

import { BASE_CHART_OPTIONS } from "@/lib/constants/chart-options";
import { useShallowChartSettingsStore } from "@/lib/store/trade/chart-settings";
import { formatDate } from "@/lib/utils/formatting/dates";
import { tickMarkFormatter } from "@/lib/utils/intervalFormatter";

const SERIES_COLORS = [
  "#fcd535",
  "#2962FF",
  "rgb(242, 142, 44)",
  //   "rgb(225, 87, 90)",
] as const;

const BINARY_SERIES_COLORS = [
  "#fcd535", // --color-primary
  "#f6465d", // --color-sell
] as const;

export interface SeriesInfo {
  name: string;
  coin: string;
  sideName: string;
  sideIndex: number;
}

type UseSeriesChartArgs = {
  seriesInfo: SeriesInfo[];
  snapshots: Array<CandleSnapshotResponse>;
};

export const useSeriesChart = ({
  seriesInfo,
  snapshots,
}: UseSeriesChartArgs) => {
  const interval = useShallowChartSettingsStore((s) => s.interval);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesApisRef = useRef<ISeriesApi<"Line">[]>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  const seriesData = useMemo(() => {
    return snapshots.filter(Boolean).map(snapshotToLineData);
  }, [snapshots]);

  const handleUpdateLegend = useCallback((param?: MouseEventParams<Time>) => {
    const validCrosshairPoint = !(
      param === undefined ||
      param.time === undefined ||
      Number(param?.point?.x) < 0 ||
      Number(param?.point?.y) < 0
    );

    const seriesApis = seriesApisRef.current;

    const legend = legendRef.current;

    if (!legend) return;

    const elements = legend.querySelectorAll<HTMLElement>("[data-chance]");

    const markers = legend.querySelectorAll<HTMLElement>(
      "[data-series-marker]",
    );

    // For categorical outcomes
    if (elements.length > 0) {
      elements.forEach((element, index) => {
        const serieApi = seriesApis[index];

        const bar = validCrosshairPoint
          ? (param.seriesData.get(serieApi) as LineData<Time>)
          : getLastBar(serieApi);

        if (bar && "value" in bar) {
          const chance = bar.value * 100;
          element.textContent = chance.toFixed(1) + "%";
        } else {
          element.textContent = "--%";
        }

        // set marker color
        markers[index].style.backgroundColor =
          SERIES_COLORS[index % SERIES_COLORS.length];
      });
    } else {
      // For binary outcomes
      const serieApi = seriesApis[0];
      const firstBar = getFirstBar(serieApi);
      const lastBar = getLastBar(serieApi);

      const seriesChangeContainer = legend.querySelector<HTMLElement>(
        "[data-series-change-container]",
      );
      const seriesChanceElement = legend.querySelector<HTMLElement>(
        "[data-series-chance]",
      );

      const bar = validCrosshairPoint
        ? (param.seriesData.get(serieApi) as LineData<Time>)
        : getLastBar(serieApi);

      const value = bar.value;

      if (firstBar && lastBar) {
        const firstChange = firstBar.value;
        const lastChange = lastBar.value;

        // Calculate the change in value
        let change = 0;
        const chance = value * 100;

        if (!validCrosshairPoint) {
          change = lastChange - firstChange;
        } else {
          change = lastChange - value;
        }

        if (seriesChangeContainer) {
          const seriesChangeElement =
            seriesChangeContainer.querySelector<HTMLElement>(
              "[data-series-change]",
            );
          const seriesChangeArrow =
            seriesChangeContainer.querySelector<HTMLElement>(
              "[data-series-change-arrow]",
            );

          // Set the color of the series change container
          seriesChangeContainer.style.color =
            change > 0 ? "var(--color-buy)" : "var(--color-sell)";

          // Set the text content of the series change element
          if (seriesChangeElement) {
            seriesChangeElement.textContent = value.toFixed(1) + "%";
          }

          // Set the rotation of the series change arrow
          if (seriesChangeArrow) {
            seriesChangeArrow.style.transform =
              change > 0 ? "rotate(0deg)" : "rotate(180deg)";
          }
        }

        if (seriesChanceElement) {
          seriesChanceElement.textContent = chance.toFixed() + "%";
        }
      }
    }
  }, []);

  const handleTooltip = useCallback((param: MouseEventParams<Time>) => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;

    const seriesApis = seriesApisRef.current;

    if (!tooltip || !container) return;

    if (!param.point || param.point.x < 0 || param.point.y < 0 || !param.time) {
      tooltip.style.opacity = "0";
      return;
    }

    let html = "";
    const lastSeriesChance: number[] = [];

    if (param.time) {
      html += `<p style="font-size: 10px; font-weight: 500; color: #b7bdc6;">${formatDate(Number(param.time))}</p>`;
    }

    seriesApis.forEach((api, index) => {
      const data = param.seriesData.get(api) as LineData<Time> | undefined;

      if (data && "value" in data) {
        const color = SERIES_COLORS[index % SERIES_COLORS.length];
        const sideInfo = seriesInfo[index];

        // if there are more than one series(categorical outcomes), use the series name, otherwise use the side name
        const name =
          seriesInfo.length > 1 ? sideInfo?.name : sideInfo?.sideName;

        const chance = data.value * 100;

        lastSeriesChance.push(chance);

        html += `
              <div style="display:flex;align-items:center;gap:6px;padding:2px 0;">
                <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
                <span style="color:#b7bdc6;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</span>
                <span style="color:${color};font-weight:600;font-size:12px;margin-left:auto;">${chance.toFixed(1)}%</span>
              </div>
            `;
      }
    });

    if (!html) {
      tooltip.style.opacity = "0";
      return;
    }

    tooltip.innerHTML = html;
    tooltip.style.opacity = "1";

    // Position near the crosshair, clamped inside the chart
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const tooltipWidth = 180;
    const tooltipHeight = tooltip.offsetHeight;

    let left = param.point.x + 16;
    let top = param.point.y - tooltipHeight / 2;

    if (left + tooltipWidth > containerWidth) {
      left = param.point.x - tooltipWidth - 16;
    }
    top = Math.max(0, Math.min(top, containerHeight - tooltipHeight));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, []);

  useEffect(() => {
    const tooltipEl = tooltipRef.current;
    if (!containerRef.current || !seriesData.length) return;

    const chart = createChart(containerRef.current, {
      ...BASE_CHART_OPTIONS,
      timeScale: {
        ...BASE_CHART_OPTIONS.timeScale,
        visible: true,
        tickMarkFormatter: (time: number) => tickMarkFormatter(time, interval),
      },
      width: containerRef.current.clientWidth,
    });

    const seriesApis: ISeriesApi<"Line">[] = [];

    seriesData.forEach((series, index) => {
      // if there are more than one series(categorical outcomes), use the series color, otherwise use the side color
      const color =
        seriesInfo.length > 1
          ? SERIES_COLORS[index % SERIES_COLORS.length]
          : BINARY_SERIES_COLORS[seriesInfo[index].sideIndex];

      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: true,
      });

      lineSeries.priceScale().applyOptions({
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.15 },
      });

      lineSeries.setData(series);

      seriesApis.push(lineSeries);
    });

    seriesApisRef.current = seriesApis;

    handleUpdateLegend();

    chart.timeScale().fitContent();

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      handleUpdateLegend(param);
      handleTooltip(param);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.remove();
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chartRef.current = null;
      seriesApisRef.current = [];
      if (tooltipEl) tooltipEl.style.opacity = "0";
    };
  }, [seriesData]);

  const updateSeries = (
    candle: CandleSnapshotResponse[number],
    seriesIndex: number,
  ) => {
    const seriesApi = seriesApisRef.current[seriesIndex];
    if (!seriesApi) return;

    const lineData = candleToLineData(candle);

    seriesApi.update(lineData);
  };

  return {
    containerRef,
    tooltipRef,
    legendRef,
    chartRef,
    updateSeries,
  };
};

export const candleToLineData = (candle: CandleSnapshotResponse[number]) => {
  return {
    time: (candle.T / 1000) as Time,
    value: Number(candle.c),
  };
};

/**
 * Transforms candle snapshot data into lightweight-charts line data.
 * Uses the closing price as the value (represents probability/chance).
 */
const snapshotToLineData = (
  snapshot: CandleSnapshotResponse,
): LineData<Time>[] => {
  return snapshot.map(candleToLineData);
};

const getLastBar = (series: ISeriesApi<"Line">) => {
  return series?.dataByIndex(Number.MAX_SAFE_INTEGER, -1) as LineData<Time>;
};

const getFirstBar = (series: ISeriesApi<"Line">) => {
  return series.dataByIndex(0, Number.MAX_SAFE_INTEGER) as LineData<Time>;
};
