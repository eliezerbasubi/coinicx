import { Activity } from "react";
import dynamic from "next/dynamic";

import {
  useChartSettingsStore,
  useShallowChartSettingsStore,
} from "@/lib/store/trade/chart-settings";

import ChartCategories from "./Header/ChartCategories";

const KlineChart = dynamic(() => import("./Charts/Kline/KlineChart"), {
  ssr: false,
});

const DepthChart = dynamic(() => import("./Charts/Depth"), { ssr: false });

const ChartArea = () => {
  const chartType = useShallowChartSettingsStore((s) => s.chartType);

  return (
    <div className="w-full">
      <ChartCategories
        value={chartType}
        onValueChange={(chartType) =>
          useChartSettingsStore.getState().setSettings({ chartType })
        }
      />
      <div
        id="chartArea"
        data-vaul-no-drag
        className="w-full h-96 md:h-75 lg:h-125 group-fullscreen/market:lg:w-full group-fullscreen/market:xl:w-full group-fullscreen/market:h-dvh"
      >
        <Activity mode={chartType === "standard" ? "visible" : "hidden"}>
          <KlineChart />
        </Activity>

        <Activity mode={chartType === "depth" ? "visible" : "hidden"}>
          <DepthChart />
        </Activity>
      </div>
    </div>
  );
};

export default ChartArea;
