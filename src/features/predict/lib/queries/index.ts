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

export const getMarketEventsMetas = async () => {
  const data = await hlInfoClient.outcomeMeta();

  const slugToOutcomeSpec = new Map<
    string,
    OutcomeMetaResponse["outcomes"][number]
  >();

  const outcomeToSlug = new Map<number, string>();

  const slugToQuestionSpec = new Map<
    string,
    OutcomeMetaResponse["questions"][number]
  >();

  const outcomeToQuestionMeta = new Map<
    number,
    { question: number; slug: string }
  >();

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
};
