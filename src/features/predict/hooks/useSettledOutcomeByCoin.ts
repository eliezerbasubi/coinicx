import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import { PredictionMetas } from "../lib/types";
import { parseSideCoinFromCoin } from "../lib/utils/outcomes";
import { usePredictionsMetas } from "./usePredictionsMetas";
import { useSettledOutcome } from "./useSettledOutcome";

export const useSettledOutcomeByCoin = (coin: string) => {
  const { data } = usePredictionsMetas();

  // Check if the outcome is settled or not
  const resolvedOutcome = resolveSettledOutcomeByCoin(coin, data);

  // Get the settled outcome if the outcome is settled
  const settledOutcomeId =
    resolvedOutcome.status === "settled" ? resolvedOutcome.outcomeId : null;

  // Fetch settled outcome
  const {
    data: settledOutcome,
    isLoading,
    error,
  } = useSettledOutcome({
    outcomeId: settledOutcomeId,
    enabled: !!data,
  });

  // If there is no resolved outcome, return null
  if (resolvedOutcome.status === "none" || error) {
    return null;
  }

  // If the outcome is active, return the outcome spec
  if (resolvedOutcome.status === "active") {
    return {
      status: "active",
      outcome: resolvedOutcome.outcomeSpec,
    };
  }

  // If there is no settled outcome, return loading
  if (isLoading) {
    return {
      status: "loading",
    };
  }

  // If there is a settled outcome, return it
  return {
    status: "settled",
    outcome: settledOutcome,
  };
};

type ResolvedOutcome =
  | {
      status: "active";
      outcomeSpec: OutcomeMetaResponse["outcomes"][number];
      sideIndex: number;
    }
  | {
      status: "settled";
      outcomeId: number;
      sideIndex: number;
    }
  | {
      status: "none";
    };

/**
 * Resolves the settled outcome for a given coin.
 * Returns null if the coin is not an active outcome.
 */
const resolveSettledOutcomeByCoin = (
  coin: string,
  predictionsMetas: PredictionMetas,
): ResolvedOutcome => {
  const parsedCoin = parseSideCoinFromCoin(coin);

  if (!parsedCoin) {
    return { status: "none" };
  }

  // Check if the coin is an active outcome
  const outcomeSlug = predictionsMetas.outcomeToSlug.get(parsedCoin.outcomeId);

  if (!outcomeSlug) {
    return { status: "none" };
  }

  // We have the active outcome slug, get the outcome spec
  const outcomeSpec = predictionsMetas.slugToOutcomeSpec.get(outcomeSlug);

  // If we have the outcome spec, then it is an active outcome
  if (outcomeSpec) {
    return {
      status: "active",
      outcomeSpec,
      sideIndex: parsedCoin.sideIndex,
    };
  }

  // We don't have the outcome spec, so it is a settled outcome
  return {
    status: "settled",
    outcomeId: parsedCoin.outcomeId,
    sideIndex: parsedCoin.sideIndex,
  };
};
