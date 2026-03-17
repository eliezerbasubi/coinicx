"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  AreaSeries,
  ChartOptions,
  ColorType,
  createChart,
  CrosshairMode,
  DeepPartial,
  LineStyle,
  Time,
} from "lightweight-charts";

import { PortfolioChartTab, PortfolioPeriod } from "@/types/portfolio";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLogo from "@/components/vectors/app-logo";
import {
  usePreferencesStore,
  useShallowPreferencesStore,
} from "@/store/trade/user-preferences";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import { usePortfolioMetrics } from "../hooks/usePortfolioMetrics";

const CHART_TABS: { value: PortfolioChartTab; label: string }[] = [
  { value: "accountValue", label: "Account Value" },
  { value: "pnl", label: "PNL" },
];

const PERIODS: { value: PortfolioPeriod; label: string }[] = [
  { value: "day", label: "24H" },
  { value: "week", label: "7D" },
  { value: "month", label: "30D" },
  { value: "allTime", label: "All Time" },
];

const PortfolioChart = () => {
  const { isLoading, metrics, period } = usePortfolioMetrics();

  const activeChartTab = useShallowPreferencesStore((s) => s.portfolioChartTab);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const seriesData = useMemo(() => {
    const history =
      activeChartTab === "accountValue"
        ? metrics?.accountValueHistory
        : metrics?.pnlHistory;

    if (!history?.length) return [];

    return history.map(([timestamp, value]) => ({
      time: Math.floor(timestamp / 1000) as Time,
      value: parseFloat(value),
    }));
  }, [metrics, activeChartTab]);

  const currentValue = seriesData.at(-1)?.value ?? 0;
  const firstValue = seriesData.at(0)?.value ?? 0;
  const change = currentValue - firstValue;
  const isPositive = change >= 0;

  useEffect(() => {
    const chartContainer = chartRef.current;
    const tooltipEl = tooltipRef.current;
    if (!chartContainer || !seriesData.length) return;

    const chart = createChart(chartContainer, {
      ...BASE_CHART_OPTIONS,
      width: chartContainer.clientWidth,
    });

    const color = isPositive ? "#fcd535" : "#f6465d";

    const area = chart.addSeries(AreaSeries, {
      priceLineColor: color,
      lineColor: color,
      topColor: color,
      bottomColor: "transparent",
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
    });

    area.priceScale().applyOptions({
      autoScale: true,
      scaleMargins: { top: 0.1, bottom: 0.15 },
    });

    area.setData(seriesData);
    chart.timeScale().fitContent();

    // Crosshair tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!tooltipEl) return;

      // Sequential early-returns let TS narrow param.point / param.time
      if (!param.time || !param.point) {
        tooltipEl.style.opacity = "0";
        return;
      }
      if (
        param.point.x < 0 ||
        param.point.x > chartContainer.clientWidth ||
        param.point.y < 0 ||
        param.point.y > CHART_HEIGHT
      ) {
        tooltipEl.style.opacity = "0";
        return;
      }

      const raw = param.seriesData.get(area);
      if (!raw || !("value" in raw)) {
        tooltipEl.style.opacity = "0";
        return;
      }

      const value = (raw as { value: number }).value;
      const label = activeChartTab === "accountValue" ? "Account Value" : "PnL";

      const valueStr = formatNumber(value, {
        style: "currency",
        minimumFractionDigits: 2,
        ...(activeChartTab === "pnl" ? { useSign: true } : {}),
      });

      // Update tooltip content via direct DOM
      const timeEl = tooltipEl.querySelector<HTMLElement>("[data-time]");
      const rowEl = tooltipEl.querySelector<HTMLElement>("[data-row]");
      if (timeEl) timeEl.textContent = formatTooltipDate(param.time as number);
      if (rowEl) rowEl.textContent = `${label}: ${valueStr}`;

      // Snap Y to the actual data-point coordinate, not the mouse cursor
      const yCoord = area.priceToCoordinate(value) ?? param.point.y;
      const tooltipHeight = tooltipEl.offsetHeight || 48;
      const tooltipWidth = tooltipEl.offsetWidth || 140;

      const x = param.point.x;
      const leftPos =
        x + tooltipWidth + 12 > chartContainer.clientWidth
          ? x - tooltipWidth - 8
          : x + 12;
      const topPos = Math.max(
        0,
        Math.min(yCoord - tooltipHeight / 2, CHART_HEIGHT - tooltipHeight),
      );

      tooltipEl.style.left = `${leftPos}px`;
      tooltipEl.style.top = `${topPos}px`;
      tooltipEl.style.opacity = "1";
    });

    return () => {
      chart.remove();
      if (tooltipEl) tooltipEl.style.opacity = "0";
    };
  }, [seriesData, isPositive, activeChartTab]);

  return (
    <div className="flex-1 min-w-0 bg-primary-dark border border-neutral-gray-200 rounded-md space-y-3">
      <div className="w-full flex items-center justify-between gap-2 flex-wrap sm:border-b border-neutral-gray-200 sm:px-4">
        <Tabs
          value={activeChartTab}
          onValueChange={(value) =>
            usePreferencesStore.getState().dispatch({
              portfolioChartTab: value as PortfolioChartTab,
            })
          }
          className="w-full sm:w-fit"
        >
          <TabsList
            variant="line"
            className="w-full justify-start sm:border-none"
          >
            {CHART_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs font-medium flex-0"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1 px-2 sm:px-0">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() =>
                usePreferencesStore
                  .getState()
                  .dispatch({ portfolioPeriod: p.value })
              }
              className={cn(
                "text-xs px-2 py-0.5 rounded font-medium transition-colors",
                period === p.value
                  ? "bg-neutral-gray-200 text-white"
                  : "text-neutral-gray-400 hover:text-white",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="w-full h-50 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <AppLogo className="w-fit h-6" />
          </div>
        )}
        {!isLoading && !seriesData.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-neutral-gray-400">No chart data</p>
          </div>
        )}
        <div ref={chartRef} className="w-full h-full" />

        {/* Hover tooltip */}
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none opacity-0 transition-opacity duration-75 z-10 bg-neutral-gray-200 rounded-md px-2.5 py-1.5 space-y-0.5"
        >
          <p
            data-time
            className="text-xs font-medium text-neutral-gray-400 whitespace-nowrap"
          />
          <p
            data-row
            className="text-xs font-bold text-white whitespace-nowrap"
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;

const CHART_HEIGHT = 200;

const BASE_CHART_OPTIONS: DeepPartial<ChartOptions> = {
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

const formatTooltipDate = (tsSeconds: number): string => {
  const date = new Date(tsSeconds * 1000);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};
