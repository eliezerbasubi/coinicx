import { OutcomeMetaResponse } from "@nktkas/hyperliquid";
import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlInfoClient } from "@/lib/services/transport";

import { isRecurring } from "../lib/utils/outcomes";
import { parseReccuringTitle } from "../lib/utils/parseMetadata";
import { slugify } from "../lib/utils/shared";

export const useMarketEventsMetas = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.predictionMarketEvents],
    staleTime: Infinity,
    queryFn: async () => {
      const data = await hlInfoClient.outcomeMeta();

      const slugToOutcomeSpec = new Map<
        string,
        OutcomeMetaResponse["outcomes"][number]
      >();
      const outcomeToSlug = new Map<number, string>();
      const slugToQuestion = new Map<
        string,
        OutcomeMetaResponse["questions"][number]
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
        slugToQuestion.set(slugify(question.name), question);
        fallbackOutcomes.add(question.fallbackOutcome);
      }

      return {
        slugToOutcomeSpec,
        slugToQuestion,
        outcomeToSlug,
        fallbackOutcomes,
      };
    },
  });

  //  const data = await hlInfoClient.outcomeMeta();

  //     const slugToOutcomeSpec = new Map<string, OutcomeMetaResponse["outcomes"][number]>();
  //     const outcomeToSlug = new Map<number, string>();
  //     const slugToQuestion = new Map<string, OutcomeMetaResponse["questions"][number]>();

  //     for (const outcome of data.outcomes) {
  //       slugToOutcomeSpec.set(slugify(outcome.name), outcome);
  //       outcomeToSlug.set(outcome.outcome, slugify(outcome.name));
  //     }

  //     for (const question of data.questions) {
  //       slugToQuestion.set(slugify(question.name), question);
  //     }

  //     return { slugToOutcomeSpec, slugToQuestion, outcomeToSlug };

  return { data, isLoading, error };
};
