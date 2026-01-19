import { PriceLevel } from "@/types/orderbook";

export const mapCumulativeDepthVisualizer = (
  levels: PriceLevel[],
): PriceLevel[] => {
  let sumAmount = 0;

  return levels.map((level) => {
    sumAmount += Number(level.sz);

    return { ...level, total: sumAmount };
  });
};

export const mapAmountDepthVisualizer = (
  levels: PriceLevel[],
): PriceLevel[] => {
  return levels.map((level) => ({ px: level.px, sz: level.sz }));
};
