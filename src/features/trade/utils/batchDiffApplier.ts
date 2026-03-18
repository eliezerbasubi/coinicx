import { L2BookWsEvent } from "@nktkas/hyperliquid";

import { PriceLevel } from "@/lib/types/orderbook";
import { debounce } from "@/lib/utils/debounce";

export function createBatchedDiffApplier(
  applyDiff: (diff: L2BookWsEvent, syncSnapshot?: () => void) => void,
) {
  let bufferedUpdates: L2BookWsEvent[] = [];

  const flushUpdates = (syncSnapshot?: () => void) => {
    if (bufferedUpdates.length === 0) return false;

    const merged = bufferedUpdates.reduce<L2BookWsEvent>((acc, cur) => {
      acc.time = Math.min(acc.time, cur.time);

      const mergeLevels = (levelsA: PriceLevel[], levelsB: PriceLevel[]) => {
        const map = new Map<string, PriceLevel>();

        levelsA.forEach((level) => map.set(level.px, level));
        levelsB.forEach((level) => map.set(level.px, level));

        return Array.from(map.values());
      };

      acc.levels = [
        mergeLevels(acc.levels[0], cur.levels[0]),
        mergeLevels(acc.levels[1], cur.levels[1]),
      ] as L2BookWsEvent["levels"];

      return acc;
    }, bufferedUpdates[0]);

    bufferedUpdates = [];
    return applyDiff(merged, syncSnapshot);
  };

  const debouncedFlush = debounce(flushUpdates, 50);

  return (diff: L2BookWsEvent, syncSnapshot?: () => void) => {
    bufferedUpdates.push(diff);
    debouncedFlush(syncSnapshot);
  };
}
