import { useEffect, useRef } from "react";
import { redirect, RedirectType } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";

import { MarketEventMeta, PredictionMetas } from "../lib/types";
import {
  mapOutcomeSpecToMarketEventMeta,
  mapQuestionToMarketEventMeta,
} from "../lib/utils/mapper";
import { parseOutcomeFromSlug } from "../lib/utils/outcomes";
import { usePredictionsMetas } from "./usePredictionsMetas";
import { useSettledOutcome } from "./useSettledOutcome";

type UseMarketEventReturn = {
  data: MarketEventMeta | null;
  status: "error" | "success" | "loading" | "settling";
  error: Error | null;
};

/**
 * Hook to get the market event meta for a given slug, handling settled outcomes.
 * This hook handles the case where the market event is a recurring one that has expired,
 * in which case it will return the settled outcome instead of the market event meta.
 *
 * @param slug The slug of the market event.
 * @returns The market event meta.
 */
export const useMarketEvent = (slug: string): UseMarketEventReturn => {
  const { data, error } = usePredictionsMetas();

  const baseMarketEventMeta = mapDataToMarketEventMeta(data, slug);

  const lastMarketEventRef = useRef<MarketEventMeta | null>(null);

  useEffect(() => {
    if (baseMarketEventMeta && typeof baseMarketEventMeta !== "number") {
      lastMarketEventRef.current = baseMarketEventMeta;
    }
  }, [baseMarketEventMeta]);

  if (error) {
    return {
      error,
      status: "error",
      data: null,
    };
  }

  if (!data) {
    return {
      status: "loading",
      error: null,
      data: null,
    };
  }

  const isSettledOutcome = typeof baseMarketEventMeta === "number";

  const settledOutcomeId = isSettledOutcome ? baseMarketEventMeta : null;

  const {
    data: settledOutcome,
    status,
    error: settledOutcomeError,
  } = useSettledOutcome({
    outcomeId: settledOutcomeId,
  });

  // If the settled outcome is pending
  if (status === "pending" && isSettledOutcome) {
    // If we have a last market event, return it with settling status
    // This is useful for when we have a market event that has expired, but we are still on the page.
    if (lastMarketEventRef.current) {
      return {
        status: "settling",
        error: null,
        data: {
          ...lastMarketEventRef.current,
          status: "waitingForSettlement",
        },
      };
    }

    return {
      status: "loading",
      error: null,
      data: null,
    };
  }

  if (settledOutcomeError) {
    return {
      error: settledOutcomeError,
      status: "error",
      data: null,
    };
  }

  if (!settledOutcome) {
    return {
      status: "success",
      error: null,
      data: baseMarketEventMeta as MarketEventMeta,
    };
  }

  return {
    data: settledOutcome,
    status: "success",
    error: null,
  };
};

const mapDataToMarketEventMeta = (data: PredictionMetas, slug: string) => {
  if (!data) return null;

  // First check if the slug is a question slug.
  const question = data.slugToQuestionSpec.get(slug);

  if (question) {
    return mapQuestionToMarketEventMeta({
      question,
      outcomeToSlug: data.outcomeToSlug,
      slugToOutcomeSpec: data.slugToOutcomeSpec,
    });
  }

  // If the slug is not a question, check if it's an outcome slug.
  const outcomeSpec = data.slugToOutcomeSpec.get(slug);

  if (!outcomeSpec) {
    // Maybe the outcome is a recurring one that has expired, and we are on a new market
    const outcomeId = parseOutcomeFromSlug(slug);

    // We didn't find the outcome from the slug
    if (!outcomeId) return null;

    // We found the id of the settled outcome,
    return outcomeId;
  }

  // Check if the outcome is part of a question.
  const questionMeta = data.outcomeToQuestionMeta.get(outcomeSpec.outcome);

  // If the outcome is not part of a question, return the market event meta for the outcome.
  if (!questionMeta) {
    return mapOutcomeSpecToMarketEventMeta(outcomeSpec);
  }

  // Proceed to check if the question meta is a question.
  const outcomeBasedQuestion = data.slugToQuestionSpec.get(questionMeta.slug);

  // No outcome based question was found, redirect to page not found
  if (!outcomeBasedQuestion) return null;

  // If the outcome is a question, redirect to the categorical event page.
  redirect(
    `${ROUTES.predict.event}/${questionMeta.slug}`,
    RedirectType.replace,
  );
};
