import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import { MarketEventMeta, MarketEventMetaOutcome } from "../types";
import { detectCategories } from "./detectCategories";
import { buildSideCoin, isRecurring } from "./outcomes";
import { parseRecurringMetadata } from "./parseMetadata";
import { slugify } from "./shared";

/**
 * Maps an outcome spec to a market event meta.
 */
export const mapOutcomeSpecToMarketEventMeta = (
  outcomeSpec: OutcomeMetaResponse["outcomes"][number],
): MarketEventMeta => {
  const isRecurringOutcome = isRecurring(outcomeSpec);

  const parsedMetadata = isRecurringOutcome
    ? parseRecurringMetadata(outcomeSpec.description, outcomeSpec.outcome)
    : null;

  return {
    coin: buildSideCoin(outcomeSpec.outcome, 0),
    title: parsedMetadata?.title ?? outcomeSpec.name,
    description: parsedMetadata?.description ?? outcomeSpec.description,
    slug: parsedMetadata?.slug ?? slugify(outcomeSpec.name),
    outcome: outcomeSpec.outcome,
    type: isRecurringOutcome ? "recurring" : "binary",
    status: "active",
    questionId: null,
    categories: detectCategories(outcomeSpec.name, outcomeSpec.description),
    outcomes: [],
    settledOutcomes: [],
    sides: outcomeSpec.sideSpecs.map((side, index) => ({
      name: side.name,
      coin: buildSideCoin(outcomeSpec.outcome, index),
    })),
    recurringPayload: parsedMetadata
      ? {
          underlying: parsedMetadata.underlying,
          class: parsedMetadata.class,
          expiry: parsedMetadata.expiry,
          targetPrice: parsedMetadata.targetPrice,
          period: parsedMetadata.period,
        }
      : null,
  };
};

/**
 * Maps a question to a market event meta.
 */
export const mapQuestionToMarketEventMeta = (params: {
  question: OutcomeMetaResponse["questions"][number];
  outcomeToSlug: Map<number, string>;
  slugToOutcomeSpec: Map<string, OutcomeMetaResponse["outcomes"][number]>;
}): MarketEventMeta => {
  const { question, outcomeToSlug, slugToOutcomeSpec } = params;

  return {
    coin: null,
    title: question.name,
    description: question.description,
    slug: slugify(question.name),
    outcome: question.fallbackOutcome,
    type: "categorical",
    status: "active",
    questionId: question.question,
    settledOutcomes: question.settledNamedOutcomes,
    categories: detectCategories(question.name, question.description),
    recurringPayload: null,
    sides: [],
    outcomes: question.namedOutcomes
      .map((namedOutcome) => {
        const slug = outcomeToSlug.get(namedOutcome);

        if (!slug) return null;

        const outcome = slugToOutcomeSpec.get(slug);

        if (!outcome) return null;

        return {
          coin: buildSideCoin(outcome.outcome, 0),
          title: outcome.name,
          outcome: outcome.outcome,
          description: outcome.description,
          sides: outcome.sideSpecs.map((side, index) => ({
            name: side.name,
            coin: buildSideCoin(outcome.outcome, index),
          })),
        };
      })
      .filter(Boolean) as MarketEventMetaOutcome[],
  };
};
