import {
  HttpTransport,
  InfoClient,
  OutcomeMetaResponse,
} from "@nktkas/hyperliquid";

import { isRecurring } from "../utils/outcomes";
import { parseReccuringTitle } from "../utils/parseMetadata";
import { slugify } from "../utils/shared";

const transport = new HttpTransport({
  isTestnet: process.env.NEXT_PUBLIC_WEB3_NETWORK === "testnet",
});

const hlInfoClient = new InfoClient({ transport });

export type PredictionMetas = {
  slugToOutcomeSpec: Map<string, OutcomeMetaResponse["outcomes"][number]>;
  slugToQuestionSpec: Map<string, OutcomeMetaResponse["questions"][number]>;
  outcomeToQuestionMeta: Map<
    number,
    {
      question: number;
      slug: string;
    }
  >;
  outcomeToSlug: Map<number, string>;
  fallbackOutcomes: Set<number>;
};

export const getPredictionsMetas = async (): Promise<PredictionMetas> => {
  try {
    const data = await hlInfoClient.outcomeMeta();

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
        slugToOutcomeSpec.set(slugify(outcome.name), outcome);
        outcomeToSlug.set(outcome.outcome, slugify(outcome.name));
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
  } catch (error) {
    throw error;
  }
};
