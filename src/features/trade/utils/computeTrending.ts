import { Asset } from "@/lib/types/trade";

const SPOT_WEIGHTS = {
  volume: 0.5,
  priceChange: 0.35,
  marketCap: 0.15,
} as const;

const PERPS_WEIGHTS = {
  volume: 0.4,
  priceChange: 0.3,
  openInterest: 0.2,
  funding: 0.1,
} as const;

/**
 * Min-max normalize a value within [min, max] to [0, 1].
 * Returns 0 when max === min (all values are the same).
 */
const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0;
  return (value - min) / (max - min);
};

/**
 * Compute a min/max range in a single pass over an array,
 * extracting the numeric value via the provided accessor.
 */
const computeRange = (
  assets: Asset[],
  accessor: (asset: Asset) => number,
): [min: number, max: number] => {
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < assets.length; i++) {
    const v = accessor(assets[i]);
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return [min, max];
};

/**
 * Compute the absolute price change percentage for an asset.
 * Returns 0 when there is no previous day price.
 */
const absPriceChangePct = (asset: Asset): number => {
  if (asset.prevDayPx === 0) return 0;
  return Math.abs((asset.markPx - asset.prevDayPx) / asset.prevDayPx);
};

/**
 * Compute the top N trending spot assets scored by
 * volume (50%), price change (35%), and market cap (15%).
 */
export const computeTrendingSpot = (
  assets: Asset[],
  count: number,
): Asset[] => {
  if (assets.length <= count) return assets;

  // Precompute ranges in a single pass each
  const [volMin, volMax] = computeRange(assets, (a) => a.dayNtlVlm);
  const [pcMin, pcMax] = computeRange(assets, absPriceChangePct);
  const [mcMin, mcMax] = computeRange(assets, (a) =>
    Number(a.marketCap ?? 0),
  );

  // Score and collect into a lightweight array to sort
  const scored: { index: number; score: number }[] = new Array(assets.length);

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const score =
      normalize(asset.dayNtlVlm, volMin, volMax) * SPOT_WEIGHTS.volume +
      normalize(absPriceChangePct(asset), pcMin, pcMax) *
        SPOT_WEIGHTS.priceChange +
      normalize(Number(asset.marketCap ?? 0), mcMin, mcMax) *
        SPOT_WEIGHTS.marketCap;

    scored[i] = { index: i, score };
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Map back to Asset objects
  const result: Asset[] = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = assets[scored[i].index];
  }

  return result;
};

/**
 * Compute the top N trending perps assets scored by
 * volume (40%), price change (30%), open interest (20%), and funding (10%).
 */
export const computeTrendingPerps = (
  assets: Asset[],
  count: number,
): Asset[] => {
  if (assets.length <= count) return assets;

  const [volMin, volMax] = computeRange(assets, (a) => a.dayNtlVlm);
  const [pcMin, pcMax] = computeRange(assets, absPriceChangePct);
  const [oiMin, oiMax] = computeRange(
    assets,
    (a) => Number(a.openInterest ?? 0),
  );
  const [fMin, fMax] = computeRange(assets, (a) =>
    Math.abs(Number(a.funding ?? 0)),
  );

  const scored: { index: number; score: number }[] = new Array(assets.length);

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const score =
      normalize(asset.dayNtlVlm, volMin, volMax) * PERPS_WEIGHTS.volume +
      normalize(absPriceChangePct(asset), pcMin, pcMax) *
        PERPS_WEIGHTS.priceChange +
      normalize(Number(asset.openInterest ?? 0), oiMin, oiMax) *
        PERPS_WEIGHTS.openInterest +
      normalize(Math.abs(Number(asset.funding ?? 0)), fMin, fMax) *
        PERPS_WEIGHTS.funding;

    scored[i] = { index: i, score };
  }

  scored.sort((a, b) => b.score - a.score);

  const result: Asset[] = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = assets[scored[i].index];
  }

  return result;
};
