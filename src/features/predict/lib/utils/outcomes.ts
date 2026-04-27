import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

const OUTCOME_COIN_PREFIX = "@";
const SIDE_COIN_PREFIX = "#";
const SIDE_COIN_PREFIX_PLUS = "+";

const OUTCOME_ASSET_ID_OFFSET = 100_000_000;

/** Outcome-level coin name (AMM instrument) */
export function buildOutcomeCoin(outcomeId: number): string {
  return `${OUTCOME_COIN_PREFIX}${outcomeId}`;
}

/** Per-side probability coin name */
export function buildSideCoin(outcomeId: number, sideIndex: number): string {
  return `#${outcomeId}${sideIndex}`;
}

/** Asset ID for order placement: OUTCOME_ASSET_ID_OFFSET + outcomeId * 10 + sideIndex */
export function buildSideAssetId(outcomeId: number, sideIndex: number): number {
  return OUTCOME_ASSET_ID_OFFSET + buildOutcomeAssetId(outcomeId, sideIndex);
}

/** Asset ID for order placement: OUTCOME_ASSET_ID_OFFSET + outcomeId */
export function buildOutcomeAssetId(
  outcomeId: number,
  sideIndex: number,
): number {
  return 10 * outcomeId + sideIndex;
}

/** Parse an outcome-level coin like "@1338" into {outcomeId} */
export function parseOutcomeCoin(coin: string): { outcomeId: number } | null {
  if (!coin.startsWith(OUTCOME_COIN_PREFIX)) return null;
  const outcomeId = parseInt(coin.slice(1), 10);
  if (isNaN(outcomeId)) return null;
  return { outcomeId };
}

/** Extract the outcome ID from either @, #, or + coin format */
export function coinOutcomeId(coin: string): number | null {
  if (
    coin.startsWith(SIDE_COIN_PREFIX) ||
    coin.startsWith(SIDE_COIN_PREFIX_PLUS)
  ) {
    const parsed = parseSideCoinFromCoin(coin);
    return parsed ? parsed.outcomeId : null;
  }
  if (coin.startsWith(OUTCOME_COIN_PREFIX)) {
    const parsed = parseOutcomeCoin(coin);
    return parsed ? parsed.outcomeId : null;
  }
  return null;
}

/** Check if a coin is an outcome-level or side-level instrument */
export function isOutcomeCoin(coin: string): boolean {
  return (
    coin.startsWith(SIDE_COIN_PREFIX) || coin.startsWith(SIDE_COIN_PREFIX_PLUS)
  );
}

/** Parse a side coin like "#5160" or "+5160" into {outcomeId, sideIndex} */
export function parseSideCoinFromCoin(e: string) {
  let t;
  if (e.startsWith(SIDE_COIN_PREFIX)) {
    t = e.slice(SIDE_COIN_PREFIX.length);
  } else {
    if (!e.startsWith(SIDE_COIN_PREFIX_PLUS)) return null;
    t = e.slice(SIDE_COIN_PREFIX_PLUS.length);
  }

  const n = parseInt(t, 10);

  if (isNaN(n) || n < 0) return null;

  return {
    outcomeId: Math.floor(n / 10),
    sideIndex: n % 10,
  };
}

/** Convert +5160 to #5160 - Plus is used for balances, # is spot name
 */
export function convertBalanceCoinToSpotName(coin: string) {
  if (coin.startsWith(SIDE_COIN_PREFIX_PLUS)) {
    return `${SIDE_COIN_PREFIX}${coin.slice(SIDE_COIN_PREFIX_PLUS.length)}`;
  }
  return coin;
}

/** Convert #5160 to +5160 - Plus is used for balances, # is spot name
 */
export function convertSpotNameToBalanceCoin(coin: string) {
  if (coin.startsWith(SIDE_COIN_PREFIX)) {
    return `${SIDE_COIN_PREFIX_PLUS}${coin.slice(SIDE_COIN_PREFIX.length)}`;
  }
  return coin;
}

export function isRecurring(
  outcome: OutcomeMetaResponse["outcomes"][number],
): boolean {
  return outcome.name === "Recurring";
}

export function parseOutcomeFromSlug(slug: string) {
  const lastHyphenIndex = slug.lastIndexOf("-");

  if (lastHyphenIndex === -1) return null;

  const assetId = slug.slice(lastHyphenIndex + 1);

  const parsedAssetId = parseInt(assetId, 10);

  if (Number.isNaN(parsedAssetId)) return null;

  const actualAssetId = parsedAssetId - OUTCOME_ASSET_ID_OFFSET;

  // check if the parsed outcome id is greater than OUTCOME_ASSET_ID_OFFSET
  if (actualAssetId < 0) return null;

  const sideIndex = actualAssetId % 10;

  // check if side index is valid
  if (sideIndex > 1) return null;

  return Math.floor(actualAssetId / 10);
}
