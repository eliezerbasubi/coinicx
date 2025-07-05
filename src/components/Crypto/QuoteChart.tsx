import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  ColorType,
  createChart,
  DeepPartial,
  TickMarkFormatter,
  Time,
  TimeChartOptions,
} from "lightweight-charts";

import { GraphPeriod } from "@/types/market";
import { getQuotes } from "@/services/markets";
import { useCryptoMarketContext } from "@/store/markets/hook";
import { cn } from "@/utils/cn";

import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  useCurrentAssets,
  useCurrentCryptoCurrency,
  useExchangeRate,
} from "./hooks";
import { getTimeRange } from "./utils";

const TABS: Array<{ value: GraphPeriod; label: string }> = [
  { value: "daily", label: "1D" },
  { value: "weekly", label: "1W" },
  { value: "monthly", label: "1M" },
  { value: "yearly", label: "1Y" },
];

const chartOptions = {
  height: 360,
  localization: {
    priceFormatter: (value: number) =>
      value.toLocaleString("en-US", { notation: "compact" }),
  },
  timeScale: {
    borderColor: "#ffffff08",
    secondsVisible: true,
    timeVisible: false,
  },
  rightPriceScale: {
    borderColor: "transparent",
  },
  grid: {
    vertLines: {
      color: "transparent",
    },

    horzLines: {
      color: "#ffffff08",
    },
  },
  handleScroll: {
    vertTouchDrag: false,
    horzTouchDrag: false,
    pressedMouseMove: false,
    mouseWheel: false,
  },
  handleScale: {
    axisPressedMouseMove: false,
    mouseWheel: false,
    axisDoubleClickReset: false,
    pinch: false,
  },
  layout: {
    fontFamily: "Inter",
    attributionLogo: false,
    fontSize: 12,
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "#ffffff9e",
  },
} as DeepPartial<TimeChartOptions>;

const QuoteChart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [currentTab, setCurrentTab] = useState<GraphPeriod>("daily");

  const marketType = useCryptoMarketContext((s) => s.marketType);
  const { cryptoAssetCode, fiatAssetCode, selectedAssets } = useCurrentAssets();
  const exchangeRate = useExchangeRate({
    baseCurrency: cryptoAssetCode,
    quoteCurrency: fiatAssetCode,
  });

  const title =
    marketType === "sell"
      ? `Sell ${cryptoAssetCode} for ${fiatAssetCode}`
      : `Buy ${cryptoAssetCode} with ${fiatAssetCode}`;

  const timeRange = getTimeRange(currentTab);

  const { data, status } = useQuery({
    queryKey: [
      "quotes",
      currentTab,
      selectedAssets?.crypto.id,
      selectedAssets?.fiat.id,
    ],
    refetchOnWindowFocus: false,
    enabled: !!selectedAssets?.crypto?.id && !!selectedAssets?.fiat.id,
    queryFn: () =>
      getQuotes(selectedAssets!.crypto.id, {
        vs_currency: selectedAssets!.fiat.assetCode,
        ...timeRange,
      }),
  });

  useEffect(() => {
    const chartElement = chartRef.current;

    if (!chartElement || !data) return;

    const chart = createChart(chartElement, {
      autoSize: false,
      ...chartOptions,
      timeScale: {
        ...chartOptions.timeScale,
        tickMarkFormatter: (time: DeepPartial<TickMarkFormatter>) => {
          switch (currentTab) {
            case "daily":
              const date = new Date(Number(time) * 1000);
              const formatted = date.toLocaleTimeString("en-US", {
                minute: "numeric",
                second: "numeric",
                hour12: true,
              });
              const amPm = date.getHours() >= 12 ? "pm" : "am";
              return `${formatted} ${amPm}`;
            case "weekly":
            case "monthly":
            case "yearly":
              return new Date(Number(time) * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

            default:
              break;
          }
        },
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      priceLineColor: "#fcd535",
      lineColor: "#fcd535",
      topColor: "#fcd535",
      bottomColor: "transparent",
    });

    areaSeries.priceScale().applyOptions({
      autoScale: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
    });

    areaSeries.setData(
      data.map(([timestamp, quote]) => ({
        time: timestamp as Time,
        value: quote,
      })),
    );

    chart.timeScale().fitContent();

    // Responsive resize observer
    const resizeObserver = new window.ResizeObserver(() => {
      chart.resize(chartElement.clientWidth, 360); // 360 is the fixed height
    });
    resizeObserver.observe(chartElement);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, chartRef.current]);

  return (
    <div className="w-full">
      <QuoteChartLegend />
      <div className="w-full flex justify-end mb-3">
        <Tabs
          value={currentTab}
          defaultValue="daily"
          onValueChange={(value) => setCurrentTab(value as GraphPeriod)}
          className="my-4"
        >
          <TabsList className="md:min-w-[200px]">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="font-semibold cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full min-h-96">
        {status === "pending" && (
          <div className="min-h-96 flex flex-col items-center justify-center">
            <p className="text-2xl text-primary font-bold">CoinicX</p>
          </div>
        )}
        <div ref={chartRef} />
      </div>
    </div>
  );
};

const QuoteChartLegend = () => {
  const marketType = useCryptoMarketContext((s) => s.marketType);
  const { cryptoAssetCode, fiatAssetCode, selectedAssets } = useCurrentAssets();
  const exchangeRate = useExchangeRate({
    baseCurrency: cryptoAssetCode,
    quoteCurrency: fiatAssetCode,
  });

  const cryptoData = useCurrentCryptoCurrency();
  const percentageChange24h = cryptoData?.price_change_percentage_24h ?? 0;

  const title =
    marketType === "sell"
      ? `Sell ${cryptoAssetCode} for ${fiatAssetCode}`
      : `Buy ${cryptoAssetCode} with ${fiatAssetCode}`;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="mb-3 mt-6 w-full">
        <div className="flex justify-between items-center mb-3 uppercase">
          <p className="text-2xl font-bold">
            {cryptoAssetCode}/{fiatAssetCode}
          </p>
          <p className="text-2xl font-bold">
            {exchangeRate?.value?.toLocaleString("en-US", {
              style: "currency",
              currency: fiatAssetCode,
            })}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="-space-x-2 inline-flex">
            <div className="size-8 rounded-full bg-primary overflow-hidden">
              {selectedAssets && (
                <Image
                  alt={selectedAssets.crypto.assetName}
                  src={selectedAssets.crypto.assetLogo}
                  className="size-8"
                  width={32}
                  height={32}
                  unoptimized
                />
              )}
            </div>
            <div className="size-8 rounded-full bg-teal-500">
              {selectedAssets && (
                <Image
                  alt={selectedAssets.fiat.assetName}
                  src={selectedAssets.fiat.assetLogo}
                  className="size-8"
                  width={32}
                  height={32}
                  unoptimized
                />
              )}
            </div>
          </div>

          <p
            className={cn("text-2xl font-bold text-green-400", {
              "text-red-400": percentageChange24h < 0,
            })}
          >
            {percentageChange24h.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteChart;
