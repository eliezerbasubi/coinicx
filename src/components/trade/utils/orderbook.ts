import { PriceLevel } from "@/types/orderbook";

export const MAX_ORDERBOOK_SIZE = 400;

/**
 * Group and sort price levels in descending order.
 * Ignores price levels with zero amount
 * @param levels Price levels to group
 * @param groupSize Gap between each price level
 * @param isBids
 * @returns an array of price levels
 */
export const groupPriceLevels = (
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

export const getTickPrice = (price: string, tickSize: number) => {
  const decimalPlaces = getDecimalPlaces(tickSize);
  const groupedPrice = Math.floor(Number(price) / tickSize) * tickSize;

  return groupedPrice.toFixed(decimalPlaces);
};

export const getDecimalPlaces = (num: number) => {
  const s = num.toString();
  return s.includes(".") ? s.split(".")[1].length : 0;
};

export const updateSide = (
  side: PriceLevel[],
  updates: PriceLevel[],
  tickSize: number,
  isCumulativeDepth: boolean,
) => {
  const newSide = side.slice();

  let sumAmount = 0;

  for (const [price, amount] of updates) {
    const tickPrice = getTickPrice(price, tickSize);

    const index = binarySearch(newSide, tickPrice);

    let newPriceLevel: PriceLevel = [tickPrice, amount];

    if (isCumulativeDepth) {
      sumAmount += Number(amount);
      newPriceLevel = [tickPrice, amount, sumAmount];
    }

    // Remove price level if there is no amount left
    if (Number(amount) === 0) {
      if (index >= 0) newSide.splice(index, 1);
    } else {
      if (index >= 0) {
        // Update existing price level
        newSide[index] = newPriceLevel;
      } else {
        // Insert new price level at the correct position
        const insertPos = -(index + 1);

        if (insertPos < MAX_ORDERBOOK_SIZE) {
          newSide.splice(insertPos, 0, newPriceLevel);
        }
      }
    }
  }

  return newSide;
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

export const mapCumulativeDepthVisualizer = (
  levels: PriceLevel[],
): PriceLevel[] => {
  let sumAmount = 0;

  return levels.map(([price, amount]) => {
    sumAmount += Number(amount);

    return [price, amount, sumAmount];
  });
};

export const mapAmountDepthVisualizer = (
  levels: PriceLevel[],
): PriceLevel[] => {
  return levels.map(([price, amount]) => [price, amount]);
};
