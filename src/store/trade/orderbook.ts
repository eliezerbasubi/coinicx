import { create } from "zustand";

import {
  IOrderBookSettings,
  OrderBook,
  OrderBookLayout,
  PriceLevel,
  Tick,
} from "@/types/orderbook";
import {
  generateTicks,
  mapAmountDepthVisualizer,
  mapCumulativeDepthVisualizer,
} from "@/features/trade/utils/orderbook";

interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  ticks: Tick[];
  tickSize: number | null;
  layout: OrderBookLayout;
  settings: IOrderBookSettings;
  setTicks: (price: number, szDecimals: number, isSpot: boolean) => void;
  onTickSizeChange: (tick: number) => void;
  onDepthVisualizerChange: (
    visualizer: IOrderBookSettings["depthVisualizer"],
  ) => void;
  setLayout: (layout: OrderBookLayout) => void;
  setSnapshot: (snapshot: { bids: PriceLevel[]; asks: PriceLevel[] }) => void;
  setSettings: (settings: Partial<IOrderBookSettings>) => void;
  getBook: () => OrderBook;
}

export const useOrderBookStore = create<OrderBookState>((set, get) => ({
  bids: [],
  asks: [],
  ticks: [],
  tickSize: null,
  layout: "orderBook",
  settings: {
    averageAndSum: true,
    showBuyAndSellRatio: true,
    rounding: true,
    depthVisualizer: "amount",
  },
  getBook: () => {
    const { asks, bids } = get();
    return { asks, bids };
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
  setTicks(price, szDecimals, isSpot) {
    const ticks = generateTicks(price, szDecimals, isSpot);
    set({ ticks, tickSize: ticks[0].value });
  },
  setLayout: (layout) => set({ layout }),
  setSettings: (data) => {
    const { settings } = get();
    set({ settings: { ...settings, ...data } });
  },
  setSnapshot: ({ bids, asks }) => {
    const { settings } = get();

    const isCumulativeDepth = settings.depthVisualizer === "cumulative";

    set({
      bids: isCumulativeDepth
        ? mapCumulativeDepthVisualizer(bids)
        : mapAmountDepthVisualizer(bids),
      asks: isCumulativeDepth
        ? mapCumulativeDepthVisualizer(asks)
        : mapAmountDepthVisualizer(asks),
    });
  },
}));
