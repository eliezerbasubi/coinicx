import { create } from "zustand";

import {
  IOrderBookSettings,
  OrderBookLayout,
  PriceLevel,
} from "@/types/orderbook";
import {
  mapAmountDepthVisualizer,
  mapCumulativeDepthVisualizer,
} from "@/features/trade/utils";

interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  lastUpdateId: number;
  tickSize: number;
  layout: OrderBookLayout;
  settings: IOrderBookSettings;
  onTickSizeChange: (
    tick: number,
  ) => void;
  onDepthVisualizerChange: (
    visualizer: IOrderBookSettings["depthVisualizer"],
  ) => void;
  setLayout: (layout: OrderBookLayout) => void;
  setSnapshot: (snapshot: { bids: PriceLevel[]; asks: PriceLevel[] }) => void;
  setSettings: (settings: Partial<IOrderBookSettings>) => void;
}

export const useOrderBookStore = create<OrderBookState>((set, get) => ({
  bids: [],
  asks: [],
  lastUpdateId: 0,
  tickSize: 5,
  layout: "orderBook",
  settings: {
    averageAndSum: true,
    showBuyAndSellRatio: true,
    rounding: true,
    depthVisualizer: "amount",
  },
  onDepthVisualizerChange: (visualizer) => {
    const { asks, bids, setSettings } = get();

    if (visualizer === "cumulative") {
      set({
        asks: mapCumulativeDepthVisualizer(asks),
        bids: mapCumulativeDepthVisualizer(bids),
      });
    } else {
      set({
        asks: mapAmountDepthVisualizer(asks),
        bids: mapAmountDepthVisualizer(bids),
      });
    }

    setSettings({ depthVisualizer: visualizer });
  },
  onTickSizeChange: (tickSize) =>
    set({
      tickSize,
    }),
  setLayout: (layout) => set({ layout }),
  setSettings: (data) => {
    const { settings } = get();
    set({ settings: { ...settings, ...data } });
  },
  setSnapshot: ({ bids, asks }) => {
    const { settings } = get();

    const isCumulativeDepth = settings.depthVisualizer === "cumulative";

    set({ bids: isCumulativeDepth ? mapCumulativeDepthVisualizer(bids) : mapAmountDepthVisualizer(bids), asks: isCumulativeDepth ? mapCumulativeDepthVisualizer(asks) : mapAmountDepthVisualizer(asks) })
  },
}));
