import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

const OUTCOME_COIN_PREFIX = "@";
const SIDE_COIN_PREFIX = "#";
const SIDE_COIN_PREFIX_PLUS = "+";

/** Outcome-level coin name (AMM instrument) */
export function buildOutcomeCoin(outcomeId: number): string {
  return `${OUTCOME_COIN_PREFIX}${outcomeId}`;
}

/** Per-side probability coin name */
export function buildSideCoin(outcomeId: number, sideIndex: number): string {
  return `#${outcomeId}${sideIndex}`;
}

/** Asset ID for order placement: 100_000_000 + outcomeId * 10 + sideIndex */
export function buildSideAssetId(outcomeId: number, sideIndex: number): number {
  return 100_000_000 + buildOutcomeAssetId(outcomeId, sideIndex);
}

/** Asset ID for order placement: 100_000_000 + outcomeId */
export function buildOutcomeAssetId(
  outcomeId: number,
  sideIndex: number,
): number {
  return 10 * outcomeId + sideIndex;
}

/** Parse a side coin like "#5160" or "+5160" into {outcomeId, sideIndex} */
export function parseSideCoin(coin: string): {
  outcomeId: number;
  sideIndex: number;
} | null {
  // HIP-4 uses # prefix, testnet may use + as an alternative
  if (
    !coin.startsWith(SIDE_COIN_PREFIX) &&
    !coin.startsWith(SIDE_COIN_PREFIX_PLUS)
  )
    return null;
  const num = coin.slice(1);
  if (num.length < 2) return null;
  const sideIndex = parseInt(num.slice(-1), 10);
  const outcomeId = parseInt(num.slice(0, -1), 10);
  if (isNaN(sideIndex) || isNaN(outcomeId)) return null;
  if (sideIndex > 1) return null;
  return { outcomeId, sideIndex };
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
    const parsed = parseSideCoin(coin);
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
    coin.startsWith(OUTCOME_COIN_PREFIX) ||
    coin.startsWith(SIDE_COIN_PREFIX) ||
    coin.startsWith(SIDE_COIN_PREFIX_PLUS)
  );
}

/** Parse a side coin like "#5160" or "+5160" into {outcomeId, sideIndex} */
export function parseSideCoinFromCoin(e: string) {
  let t;
  if (e.startsWith(OUTCOME_COIN_PREFIX)) {
    t = e.slice(OUTCOME_COIN_PREFIX.length);
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

export function isRecurring(
  outcome: OutcomeMetaResponse["outcomes"][number],
): boolean {
  return outcome.name === "Recurring";
}
