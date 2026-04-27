import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import {
  PREDICTIONS_BASE_SZ_DECIMALS,
  PREDICTIONS_QUOTE_ASSET,
  PREDICTIONS_QUOTE_SZ_DECIMALS,
} from "../constants/predictions";
import {
  MarketEventMeta,
  MarketEventMetaOutcome,
  PredictionMetas,
} from "../types";
import { detectCategories } from "./detectCategories";
import {
  buildSideAssetId,
  buildSideCoin,
  isOutcomeCoin,
  isRecurring,
  parseSideCoinFromCoin,
} from "./outcomes";
import { parseReccuringTitle, parseRecurringMetadata } from "./parseMetadata";
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

export const mapDataToPredictionsMetas = (
  data: OutcomeMetaResponse,
): PredictionMetas => {
  const slugToOutcomeSpec: PredictionMetas["slugToOutcomeSpec"] = new Map();

  const outcomeToSlug: PredictionMetas["outcomeToSlug"] = new Map();

  const slugToQuestionSpec: PredictionMetas["slugToQuestionSpec"] = new Map();

  const outcomeToQuestionMeta: PredictionMetas["outcomeToQuestionMeta"] =
    new Map();

  const fallbackOutcomes = new Set<number>();

  for (const outcome of data.outcomes) {
    const isRecurringOutcome = isRecurring(outcome);

    if (isRecurringOutcome) {
      const { slug } = parseReccuringTitle(outcome);
      slugToOutcomeSpec.set(slug, outcome);
      outcomeToSlug.set(outcome.outcome, slug);
    } else {
      // Append the outcome id to the slug to ensure uniqueness as a binary outcome can be on different questions with the same name
      const slug = slugify(outcome.name + "-" + outcome.outcome);
      slugToOutcomeSpec.set(slug, outcome);
      outcomeToSlug.set(outcome.outcome, slug);
    }
  }

  for (const question of data.questions) {
    slugToQuestionSpec.set(slugify(question.name), question);

    for (const outcome of question.namedOutcomes) {
      outcomeToQuestionMeta.set(outcome, {
        question: question.question,
        slug: slugify(question.name),
      });
    }

    fallbackOutcomes.add(question.fallbackOutcome);
  }

  return {
    slugToOutcomeSpec,
    slugToQuestionSpec,
    outcomeToQuestionMeta,
    outcomeToSlug,
    fallbackOutcomes,
  };
};

export const mapCoinToMarketEventSpec = (
  coin: string,
  metas: PredictionMetas,
) => {
  if (!isOutcomeCoin(coin)) return null;

  const parsedData = parseSideCoinFromCoin(coin);

  if (!parsedData) return null;

  const outcomeSlug = metas.outcomeToSlug.get(parsedData.outcomeId);

  if (!outcomeSlug) return null;

  const outcomeSpec = metas.slugToOutcomeSpec.get(outcomeSlug);

  if (!outcomeSpec) return null;

  // Check if the outcome is part of a question.
  const questionMeta = metas.outcomeToQuestionMeta.get(outcomeSpec.outcome);

  const question = questionMeta
    ? metas.slugToQuestionSpec.get(questionMeta.slug)
    : null;

  const parsedMetadata = isRecurring(outcomeSpec)
    ? parseRecurringMetadata(outcomeSpec.description, outcomeSpec.outcome)
    : null;

  return {
    assetId: buildSideAssetId(parsedData.outcomeId, parsedData.sideIndex),
    title: parsedMetadata?.title ?? outcomeSpec.name,
    slug:
      questionMeta?.slug ?? parsedMetadata?.slug ?? slugify(outcomeSpec.name),
    outcome: parsedData.outcomeId,
    sideIndex: parsedData.sideIndex,
    sideName: outcomeSpec.sideSpecs[parsedData.sideIndex].name,
    quote: PREDICTIONS_QUOTE_ASSET,
    pxDecimals: PREDICTIONS_QUOTE_SZ_DECIMALS,
    szDecimals: PREDICTIONS_BASE_SZ_DECIMALS,
    question,
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
