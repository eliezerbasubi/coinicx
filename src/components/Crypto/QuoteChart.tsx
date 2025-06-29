import React, { useEffect, useRef, useState } from "react";
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

import { getQuotes } from "@/services/markets";

import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type Props = {};

type Tab = "daily" | "weekly" | "monthly" | "yearly";

const chartOptions = {
  height: 360,
  // localization: {
  //   priceFormatter: (value: number) => `${value.toFixed(2)}%`,
  // },
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

const QuoteChart = (props: Props) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>("daily");

  const { data, status } = useQuery({
    queryKey: ["quotes", currentTab],
    queryFn: () => getQuotes(),
    refetchOnWindowFocus: false,
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
      data.map((datum) => ({
        time: Date.parse(datum.timestamp) as Time,
        value: datum.quote.USD.price,
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
      <div className="mb-3 mt-6 w-full">
        <div className="flex justify-between items-center mb-3">
          <p className="text-2xl font-bold">BNB/AED</p>
          <p className="text-2xl font-bold">
            {Number(3480).toLocaleString("en-US", { currency: "USD" })}AED
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="-space-x-2 inline-flex">
            <div className="size-8 rounded-full bg-primary"></div>
            <div className="size-8 rounded-full bg-teal-500"></div>
          </div>

          <p className="text-2xl font-bold text-green-400">+1.32%</p>
        </div>
      </div>
      <div className="w-full flex justify-end mb-3">
        <Tabs
          value={currentTab}
          defaultValue="daily"
          onValueChange={(value) => setCurrentTab(value as Tab)}
          className="my-4"
        >
          <TabsList className="md:min-w-[200px]">
            <TabsTrigger value="daily" className="font-semibold">
              1D
            </TabsTrigger>
            <TabsTrigger value="weekly" className="font-semibold">
              7D
            </TabsTrigger>
            <TabsTrigger value="monthly" className="font-semibold">
              1M
            </TabsTrigger>
            <TabsTrigger value="yearly" className="font-semibold">
              1Y
            </TabsTrigger>
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

export default QuoteChart;
