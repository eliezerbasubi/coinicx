import { DepthUpdate, PriceLevel } from "@/types/orderbook";
import { debounce } from "@/utils/debounce";

export function createBatchedDiffApplier(
  applyDiff: (diff: DepthUpdate, syncSnapshot?: () => void) => void,
) {
  let bufferedUpdates: DepthUpdate[] = [];

  const flushUpdates = (syncSnapshot?: () => void) => {
    if (bufferedUpdates.length === 0) return false;

    // Merge buffered updates into one by taking smallest U, biggest u and merging bids & asks:
    const merged = bufferedUpdates.reduce<DepthUpdate>((acc, cur) => {
      acc.U = Math.min(acc.U, cur.U);
      acc.u = Math.max(acc.u, cur.u);

      const mergeLevels = (levelsA: PriceLevel[], levelsB: PriceLevel[]) => {
        const map = new Map<string, string>();

        levelsA.forEach(([p, q]) => map.set(p, q));
        levelsB.forEach(([p, q]) => map.set(p, q));

        return Array.from(map.entries());
      };

      acc.b = mergeLevels(acc.b, cur.b);
      acc.a = mergeLevels(acc.a, cur.a);

      return acc;
    }, bufferedUpdates[0]);

    bufferedUpdates = [];
    return applyDiff(merged, syncSnapshot);
  };

  const debouncedFlush = debounce(flushUpdates, 50);

  return (diff: DepthUpdate, syncSnapshot?: () => void) => {
    bufferedUpdates.push(diff);
    debouncedFlush(syncSnapshot);
  };
}
