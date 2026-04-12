"use client";

import React, { use, useMemo } from "react";
import { notFound, redirect, RedirectType } from "next/navigation";
import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import { ROUTES } from "@/lib/constants/routes";

import PredictEventPageSkeleton from "../components/PredictEventPageSkeleton";
import { useMarketEventsMetas } from "../hooks/useMarketEventsMetas";
import { useSpotMetas } from "../hooks/useSpotMetas";
import MarketEventStoreProvider from "../lib/store/market-event/provider";
import { MarketEventMeta, MarketEventMetaOutcome } from "../lib/types";
import { detectCategories } from "../lib/utils/detectCategories";
import { buildSideCoin, isRecurring } from "../lib/utils/outcomes";
import { parseRecurringMetadata } from "../lib/utils/parseMetadata";
import { slugify } from "../lib/utils/shared";
import MarketEventCtxProvider from "./market-event-ctx-provider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const MarketEventProvider = ({ children, params }: Props) => {
  const { slug } = use(params);

  const { data, isLoading } = useMarketEventsMetas();

  const marketEventMeta = useMemo<MarketEventMeta | null>(() => {
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

    if (!outcomeSpec) return null;

    // Check if the outcome is part of a question.
    const questionMeta = data.outcomeToQuestionMeta.get(outcomeSpec.outcome);

    // If the outcome is not part of a question, return the market event meta for the outcome.
    if (!questionMeta) {
      return mapOutcomeSpecToMarketEventMeta(outcomeSpec);
    }

    // Proceed to check if the question meta is a question.
    const outcomeBasedQuestion = data.slugToQuestionSpec.get(questionMeta.slug);

    if (!outcomeBasedQuestion) return null;

    // If the outcome is a question, redirect to the categorical event page.
    redirect(
      `${ROUTES.predict.event}/${questionMeta.slug}`,
      RedirectType.replace,
    );
  }, [data, slug]);

  useSpotMetas({
    // We only want to fetch spot meta for recurring events.
    // TODO: Check if we could enforce the restriction to recurring events where the class property is set to priceBinary.
    enabled: marketEventMeta?.type === "recurring",

    // We are just prefetching here, we don't want the component to re-render when the spot meta is updated.
    notifyOnChangeProps: [],
  });

  if (isLoading) return <PredictEventPageSkeleton />;

  if (!marketEventMeta) return notFound();

  return (
    <MarketEventStoreProvider marketEventMeta={marketEventMeta}>
      <MarketEventCtxProvider />
      {children}
    </MarketEventStoreProvider>
  );
};

/**
 * Maps an outcome spec to a market event meta.
 */
const mapOutcomeSpecToMarketEventMeta = (
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
    slug: slugify(outcomeSpec.name),
    resolution: outcomeSpec.outcome,
    type: isRecurringOutcome ? "recurring" : "binary",
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
const mapQuestionToMarketEventMeta = (params: {
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
    resolution: question.fallbackOutcome,
    type: "categorical",
    questionId: question.question,
    settledOutcomes: question.settledNamedOutcomes,
    categories: detectCategories(question.name, question.description),
    recurringPayload: null,
    sides: [],
    outcomes: question.namedOutcomes
      .map((namedOutcome, index) => {
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

export default MarketEventProvider;
