import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import { PredictionMetas } from "../types";
import { isRecurring } from "../utils/outcomes";
import { parseReccuringTitle } from "../utils/parseMetadata";
import { slugify } from "../utils/shared";

export const getPredictionsMetas = (
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
      const slug = slugify(outcome.name);
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
