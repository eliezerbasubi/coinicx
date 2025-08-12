import { create } from "zustand";

import {
  DepthUpdate,
  IOrderBookSettings,
  OrderBookLayout,
  PriceLevel,
} from "@/types/orderbook";
import {
  groupPriceLevels,
  mapAmountDepthVisualizer,
  mapCumulativeDepthVisualizer,
  MAX_ORDERBOOK_SIZE,
  updateSide,
} from "@/components/trade/utils";

interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  lastUpdateId: number;
  tickSize: number;
  layout: OrderBookLayout;
  settings: IOrderBookSettings;
  onTickSizeChange: (
    tick: number,
    bids: PriceLevel[],
    asks: PriceLevel[],
  ) => void;
  onDepthVisualizerChange: (
    visualizer: IOrderBookSettings["depthVisualizer"],
  ) => void;
  setLayout: (layout: OrderBookLayout) => void;
  setSnapshot: (snapshot: {
    lastUpdateId: number;
    bids: PriceLevel[];
    asks: PriceLevel[];
  }) => void;
  setSettings: (settings: Partial<IOrderBookSettings>) => void;
  applyDiff: (diff: DepthUpdate, syncSnapshot?: () => void) => void;
}

export const useOrderBookStore = create<OrderBookState>((set, get) => ({
  bids: [],
  asks: [],
  lastUpdateId: 0,
  tickSize: 0.01,
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
  onTickSizeChange: (tickSize, bids, asks) =>
    set({
      tickSize,
      bids: groupPriceLevels(bids, tickSize),
      asks: groupPriceLevels(asks, tickSize),
    }),
  setLayout: (layout) => set({ layout }),
  setSettings: (data) => {
    const { settings } = get();
    set({ settings: { ...settings, ...data } });
  },
  setSnapshot: ({ lastUpdateId, bids, asks }) => {
    const { tickSize } = get();

    set(() => ({
      bids: groupPriceLevels(bids.slice(0, MAX_ORDERBOOK_SIZE), tickSize),
      asks: groupPriceLevels(
        asks.slice(0, MAX_ORDERBOOK_SIZE).reverse(),
        tickSize,
      ),
      lastUpdateId,
    }));
  },

  applyDiff: ({ U, u, b, a }, syncSnapshot) => {
    const { lastUpdateId, bids, asks, tickSize, settings } = get();

    // Ignore update if it is out of order or older than current state
    if (u <= lastUpdateId) return;

    // Binance requires that the diff's first update ID (U) is exactly lastUpdateId + 1 or less
    if (U > lastUpdateId + 1) {
      // Out of sync — ideally trigger snapshot reload here
      console.warn("Order book out of sync. Need to reload snapshot.");

      syncSnapshot?.();
      return;
    }

    const isCumulativeDepth = settings.depthVisualizer === "cumulative";

    set(() => ({
      bids: updateSide(bids, b, tickSize, isCumulativeDepth),
      asks: updateSide(asks, a, tickSize, isCumulativeDepth),
      lastUpdateId: u,
    }));
  },
}));
