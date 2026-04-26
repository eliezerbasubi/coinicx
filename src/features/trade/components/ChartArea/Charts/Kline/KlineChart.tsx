import { useCallback, useEffect, useRef } from "react";
import { ISubscription } from "@nktkas/hyperliquid";
import { Chart, dispose, init, KLineData } from "klinecharts";

import { hlInfoClient, hlSubClient } from "@/lib/services/transport";
import { useChartSettingsStore } from "@/lib/store/trade/chart-settings";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { getChartTimeRange } from "@/lib/utils/intervalFormatter";
import { useTradeContext } from "@/features/trade/store/hooks";

import KlineTooltipTitle from "./KlineTooltipTitle";
import KlineVolIndicatorTitle from "./KlineVolIndicatorTitle";
import { CrosshairEventData, KlineIndicatorEventData } from "./types";
import { getKlinePeriod } from "./utils/getKlinePeriod";
import kLineStyles from "./utils/kLineStyles";
import { waitForIndicatorResults } from "./utils/waitForIndicatorResults";

const KlineChart = () => {
  const interval = useChartSettingsStore((s) => s.interval);

  const chartRef = useRef<Chart>(null);
  const subscriptionRef = useRef<ISubscription>(null);

  // A flag to detect when the crosshair changes in order to avoid updating indicator values
  const isCrosshairChange = useRef(false);

  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const volIndicatorWrapperRef = useRef<HTMLDivElement>(null);
  const candleTooltipRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const { pxDecimals, coin } = useTradeContext((s) => ({
    pxDecimals: s.assetMeta.pxDecimals,
    coin: s.assetMeta.coin,
  }));

  const handleCandleTooltip = useCallback((klineData: KLineData) => {
    if (!klineData) return;

    Object.entries(klineData).forEach(([key, value]) => {
      const element = candleTooltipRefs.current[key];
      const changeElement = candleTooltipRefs.current["change"];

      // If the closing price is higher than the opening price, the candle is considered bullish (buy candle) — indicating buying pressure, price is going up during the interval.
      // If the closing price is lower than the opening price, the candle is considered bearish (sell candle) — indicating selling pressure, price is going down during the interval.
      const close = klineData.close;
      const open = klineData.open;

      const isBuyCandle = close > open;

      const change = ((open - close) / close) * 100;

      // Set change percentage and color
      if (changeElement) {
        changeElement.innerHTML = `${change.toFixed(2)}%`;
        changeElement.style.color =
          change >= 0 ? "var(--color-buy)" : "var(--color-sell)";
      }

      if (element) {
        // Set colors
        if (key !== "timestamp") {
          element.style.color = isBuyCandle
            ? "var(--color-buy)"
            : "var(--color-sell)";
          element.innerHTML = formatNumber(Number(value), {
            minimumFractionDigits: 2,
          });
        }

        if (key === "timestamp") {
          element.innerHTML = new Date(Number(value)).toLocaleString("en-US");
        }
      }
    });
  }, []);

  const handleIndicatorTooltip = useCallback(
    (indicatorEventData: KlineIndicatorEventData) => {
      if (!indicatorEventData) return;

      Object.values(indicatorEventData).forEach((data) => {
        if (!data) return;

        Object.entries(data).forEach(([key, value]) => {
          const element = candleTooltipRefs.current[key];

          if (element) {
            element.innerHTML = value.toFixed(2);
          }
        });
      });
    },
    [],
  );

  useEffect(() => {
    if (!coin || !chartWrapperRef.current) return;

    chartRef.current = init("klinechart", {
      layout: [
        {
          type: "candle",
          content: [],
          options: { order: Number.MIN_SAFE_INTEGER },
        },
        { type: "indicator", content: ["VOL"] },
        { type: "xAxis", options: { order: 9 } },
      ],
      styles: kLineStyles,
    });

    const chart = chartRef.current;

    if (!chart) return;

    chart.setSymbol({
      ticker: coin,
      pricePrecision: pxDecimals ?? 2,
      volumePrecision: pxDecimals ?? 2,
    });

    const period = getKlinePeriod(interval);

    chart.setPeriod({ span: period.span, type: period.type });

    chart.setDataLoader({
      getBars: async ({ callback, symbol }) => {
        const timeRange = getChartTimeRange(interval);

        const queryClient = getQueryClient();

        const data = await queryClient.fetchQuery({
          queryKey: ["asset-candle-snapshot", symbol.ticker],
          queryFn: () =>
            hlInfoClient.candleSnapshot({
              coin: symbol.ticker,
              interval,
              startTime: timeRange.startTime,
            }),
        });

        const klines = data.map((candle) => ({
          timestamp: candle.T,
          open: Number(candle.o),
          high: Number(candle.h),
          low: Number(candle.l),
          close: Number(candle.c),
          volume: Number(candle.v),
        }));

        callback(klines);

        const lastKlineData = klines[klines.length - 1];

        handleCandleTooltip(lastKlineData);

        waitForIndicatorResults(chart, (latestDataValue) => {
          handleIndicatorTooltip(latestDataValue as KlineIndicatorEventData);
        });
      },
      subscribeBar: async ({ symbol, callback }) => {
        subscriptionRef.current = await hlSubClient.candle(
          { coin: symbol.ticker, interval },
          (data) => {
            const bar = {
              timestamp: data.T,
              open: Number(data.o),
              high: Number(data.h),
              low: Number(data.l),
              close: Number(data.c),
              volume: Number(data.v),
            };

            callback(bar);

            // Update candle tooltip if user is not hovering on the chart
            if (!isCrosshairChange.current) {
              handleCandleTooltip(bar);
            }
          },
        );
      },
      unsubscribeBar: async () => {
        subscriptionRef.current?.unsubscribe();
      },
    });

    chart.subscribeAction("onCrosshairChange", (data) => {
      const payload = data as unknown as CrosshairEventData;

      handleCandleTooltip(payload.crosshair.kLineData);
      handleIndicatorTooltip(payload.indicatorData[payload.crosshair.paneId]);

      isCrosshairChange.current = true;
    });

    return () => {
      dispose("klinechart");
      chart.unsubscribeAction("onCrosshairChange");
      subscriptionRef.current?.unsubscribe();
    };
  }, [coin, interval]);

  const handleVolIndicatorPosition = (chartWrapperHeight: number) => {
    const remainingBottomHeight = 126; // Height of the volume indicator (100) plus the height of the bottom xaxis(26)

    if (volIndicatorWrapperRef.current) {
      volIndicatorWrapperRef.current.style.top = `${chartWrapperHeight - remainingBottomHeight}px`;
    }
  };

  // Detect chart resize
  useEffect(() => {
    if (!chartWrapperRef.current) return;

    const controller = new AbortController();

    // Update top position of the volume indicator
    handleVolIndicatorPosition(
      chartWrapperRef.current.getBoundingClientRect().height,
    );

    document.addEventListener(
      "fullscreenchange",
      () => {
        chartRef.current?.resize();
      },
      { signal: controller.signal },
    );

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;

      if (entry) {
        // We debounce resize for 500ms to avoid frequent calls which may affect performance
        new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
          chartRef.current?.resize();
        });

        handleVolIndicatorPosition(entry.contentRect.height);
      }
    });

    observer.observe(chartWrapperRef.current);

    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, []);

  return (
    <div
      data-vaul-no-drag
      id="klinechart"
      className="relative size-full flex-1 border-l border-neutral-gray-200"
      ref={chartWrapperRef}
      onPointerLeave={() => (isCrosshairChange.current = false)}
    >
      <div className="absolute left-0 top-0 h-0 w-full z-5">
        <div
          className="pt-1 pl-1 absolute"
          onPointerEnter={() => (isCrosshairChange.current = false)}
        >
          <KlineTooltipTitle ref={candleTooltipRefs} />
          {/* <KlineCandleIndicatorTitle ref={candleTooltipRefs} /> */}
          <KlineVolIndicatorTitle
            ref={candleTooltipRefs}
            wrapperRef={volIndicatorWrapperRef}
          />
        </div>
      </div>
    </div>
  );
};

export default KlineChart;
