import { create } from "zustand";

import { DepthUpdate, OrderBookLayout, PriceLevel } from "@/types/orderbook";

interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  lastUpdateId: number;
  tickSize: number;
  layout: OrderBookLayout;
  onTickSizeChange: (
    tick: number,
    bids: PriceLevel[],
    asks: PriceLevel[],
  ) => void;
  setLayout: (layout: OrderBookLayout) => void;
  setSnapshot: (snapshot: {
    lastUpdateId: number;
    bids: PriceLevel[];
    asks: PriceLevel[];
  }) => void;
  applyDiff: (diff: DepthUpdate, syncSnapshot?: () => void) => void;
}

const MAX_ORDERBOOK_SIZE = 400;

/**
 * Group and sort price levels in descending order.
 * Ignores price levels with zero amount
 * @param levels Price levels to group
 * @param groupSize Gap between each price level
 * @param isBids
 * @returns an array of price levels
 */
const groupPriceLevels = (
  levels: PriceLevel[],
  groupSize: number,
): PriceLevel[] => {
  const groupedMap = new Map<string, string>();

  for (const [price, qty] of levels) {
    if (+qty <= 0) continue;

    const tickPrice = getTickPrice(price, groupSize);

    groupedMap.set(
      tickPrice,
      `${Number(groupedMap.get(tickPrice) || 0) + Number(qty)}`,
    );
  }

  return Array.from(groupedMap.entries()).sort((a, b) => +b[0] - +a[0]);
};

const getTickPrice = (price: string, tickSize: number) => {
  const decimalPlaces = getDecimalPlaces(tickSize);
  const groupedPrice = Math.floor(Number(price) / tickSize) * tickSize;

  return groupedPrice.toFixed(decimalPlaces);
};

const getDecimalPlaces = (num: number) => {
  const s = num.toString();
  return s.includes(".") ? s.split(".")[1].length : 0;
};

const updateSide = (
  side: PriceLevel[],
  updates: PriceLevel[],
  tickSize: number,
) => {
  let newSide = side.slice();

  for (const [price, amount] of updates) {
    const tickPrice = getTickPrice(price, tickSize);

    const index = binarySearch(newSide, tickPrice);

    // Remove price level if there is no amount left
    if (Number(amount) === 0) {
      if (index >= 0) newSide.splice(index, 1);
    } else {
      if (index >= 0) {
        // Update existing price level
        newSide[index] = [tickPrice, amount];
      } else {
        // Insert new price level at the correct position
        const insertPos = -(index + 1);

        if (insertPos < MAX_ORDERBOOK_SIZE) {
          newSide.splice(insertPos, 0, [tickPrice, amount]);
        }
      }
    }
  }

  return newSide;
  // const map = new Map(newSide.map(([p, q]) => [p, q]));
  // return Array.from(map.entries());
};

const binarySearch = (arr: PriceLevel[], price: string) => {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (Number(arr[mid][0]) === Number(price)) {
      return mid; // found exact price
    }
    if (Number(arr[mid][0]) < Number(price)) {
      // Look left (higher prices)
      high = mid - 1;
    } else {
      // Look right (lower prices)
      low = mid + 1;
    }
  }

  // Not found, return negative insertion index
  return -(low + 1);
};

export const useOrderBookStore = create<OrderBookState>((set, get) => ({
  bids: [],
  asks: [],
  lastUpdateId: 0,
  tickSize: 0.01,
  layout: "orderBook",
  onTickSizeChange: (tickSize, bids, asks) =>
    set({
      tickSize,
      bids: groupPriceLevels(bids, tickSize),
      asks: groupPriceLevels(asks, tickSize),
    }),
  setLayout: (layout) => set({ layout }),
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
    const { lastUpdateId, bids, asks, tickSize } = get();

    // Ignore update if it is out of order or older than current state
    if (u <= lastUpdateId) return;

    // Binance requires that the diff's first update ID (U) is exactly lastUpdateId + 1 or less
    if (U > lastUpdateId + 1) {
      // Out of sync — ideally trigger snapshot reload here
      console.warn("Order book out of sync. Need to reload snapshot.");

      syncSnapshot?.();
      return;
    }

    set(() => ({
      bids: updateSide(bids, b, tickSize),
      asks: updateSide(asks, a, tickSize),
      lastUpdateId: u,
    }));
  },
}));
