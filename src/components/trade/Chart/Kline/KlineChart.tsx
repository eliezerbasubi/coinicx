import { useCallback, useEffect, useRef } from "react";
import { Chart, dispose, init, KLineData, LayoutChild } from "klinecharts";

import { ChartInterval } from "@/types/trade";
import { getKlines } from "@/services/trade";
import { useTradeContext } from "@/store/trade/hooks";
import { formatNumber } from "@/utils/formatting/numbers";

import KlineCandleIndicatorTitle from "./KlineCandleIndicatorTitle";
import KlineTooltipTitle from "./KlineTooltipTitle";
import KlineVolIndicatorTitle from "./KlineVolIndicatorTitle";
import { useKlineStore } from "./store/kLineStore";
import {
  CrosshairEventData,
  KlineIndicatorEventData,
  KLineStreamData,
} from "./types";
import { getIndicatorCalc } from "./utils/getIndicatorCalc";
import kLineStyles from "./utils/kLineStyles";
import { waitForIndicatorResults } from "./utils/waitForIndicatorResults";

type Props = {
  interval: ChartInterval;
};

const KlineChart = ({ interval }: Props) => {
  const indicatorsLayout = useKlineStore((s) => s.indicatorsLayout);

  const chartRef = useRef<Chart>(null);

  // A flag to detect when the crosshair changes in order to avoid updating indicator values
  const isCrosshairChange = useRef(false);

  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const volIndicatorWrapperRef = useRef<HTMLDivElement>(null);
  const candleTooltipRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const symbol = useTradeContext((s) => s.symbol);
  const setMarketTicker = useTradeContext((s) => s.setMarketTicker);

  const handleCandleTooltip = useCallback((klineData: KLineData) => {
    Object.entries(klineData).forEach(([key, value]) => {
      const element = candleTooltipRefs.current[key];
      const changeElement = candleTooltipRefs.current["change"];

      // If the closing price is higher than the opening price, the candle is considered bullish (buy candle) — indicating buying pressure, price is going up during the interval.
      // If the closing price is lower than the opening price, the candle is considered bearish (sell candle) — indicating selling pressure, price is going down during the interval.
      const close = klineData.close;
      const open = klineData.open;

      const isBuyCandle = close > open;

      const change = ((close - open) / open) * 100;

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
    chartRef.current = init("klinechart", {
      // TODO: Improve and Expand this implement
      layout: [
        { type: "xAxis", options: { order: 9 } },
        ...(indicatorsLayout.map((layout) => {
          if (layout.type === "CANDLE") {
            return {
              type: "candle",
              content: layout.indicators.map((indicator) => ({
                name: indicator.name,
                shortName: indicator.name,
                visible: indicator.showSeries,
                series: "price",
                precision: 2,
                calcParams: indicator.params,
                figures: indicator.params.map((param, index) => ({
                  type: "line",
                  title: `${indicator.name}(${param.period})`,
                  key: `${indicator.name}[${index}]`,
                  styles: () => ({
                    color: param.color,
                    size: param.lineWidth,
                  }),
                })),
                calc: getIndicatorCalc,
              })),
              options: { order: Number.MIN_SAFE_INTEGER },
            };
          }
          return { type: "indicator", content: ["VOL"] };
        }) as LayoutChild[]),
      ],
      styles: kLineStyles,
    });

    const chart = chartRef.current;

    if (!chart) return;

    chart.setSymbol({
      ticker: symbol,
      pricePrecision: 2,
      volumePrecision: 2,
    });

    chart.setPeriod({ span: interval.span, type: interval.type });

    chart.setDataLoader({
      getBars: async ({ callback }) => {
        const data = await getKlines({ symbol, interval: interval.value });

        const klines = data.map((lines) => ({
          timestamp: Number(lines[0]),
          open: Number(lines[1]),
          high: Number(lines[2]),
          low: Number(lines[3]),
          close: Number(lines[4]),
          volume: Number(lines[5]),
        }));

        callback(klines);

        const lastKlineData = klines[klines.length - 1];

        handleCandleTooltip(lastKlineData);

        waitForIndicatorResults(chart, (latestDataValue) => {
          handleIndicatorTooltip(latestDataValue as KlineIndicatorEventData);
        });
      },
      subscribeBar: ({ period, symbol, callback }) => {
        // TODO: Remove this implementation and unsubscribe to web socket
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${symbol.ticker.toLowerCase()}@kline_${period.span + period.type.slice(0, 1)}`,
        );

        ws.onmessage = (event) => {
          const data: KLineStreamData = JSON.parse(event.data);

          const bar: KLineData = {
            timestamp: data.k.t,
            open: Number(data.k.o),
            high: Number(data.k.h),
            low: Number(data.k.l),
            close: Number(data.k.c),
            volume: Number(data.k.v),
          };

          callback(bar);

          // Update candle tooltip if user is not hovering on the chart
          if (!isCrosshairChange.current) {
            handleCandleTooltip(bar);
          }

          setMarketTicker({
            o: bar.open,
            h: bar.high,
            l: bar.low,
            c: bar.close,
            v: bar.volume,
          });
        };
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
    };
  }, [symbol, interval]);

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
    const { signal } = controller;

    // Update top position of the volume indicator
    handleVolIndicatorPosition(
      chartWrapperRef.current.getBoundingClientRect().height,
    );

    document.addEventListener(
      "fullscreenchange",
      () => {
        chartRef.current?.resize();
      },
      { signal },
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
          <KlineCandleIndicatorTitle ref={candleTooltipRefs} />
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
