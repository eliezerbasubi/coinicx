"use client";

import React, { use, useMemo } from "react";
import { notFound } from "next/navigation";

import { useMarketEventsMetas } from "../hooks/useMarketEventsMetas";
import { useSpotMetas } from "../hooks/useSpotMetas";
import MarketEventStoreProvider from "../store/market-event/provider";
import { MarketEventMeta, MarketEventMetaOutcome } from "../types";
import { detectCategories } from "../utils/detectCategories";
import { buildSideCoin, isRecurring } from "../utils/outcomes";
import { parseRecurringMetadata } from "../utils/parseMetadata";
import { slugify } from "../utils/shared";
import MarketEventCtxProvider from "./market-event-ctx-provider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const MarketEventProvider = ({ children, params }: Props) => {
  const { slug } = use(params);

  const { data, isLoading, error } = useMarketEventsMetas();

  const marketEventMeta = useMemo<MarketEventMeta | null>(() => {
    if (!data) return null;

    const question = data.slugToQuestion.get(slug);

    if (question) {
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
          .map((namedOutcome) => {
            const slug = data.outcomeToSlug.get(namedOutcome);

            if (!slug) return null;

            const outcome = data.slugToOutcomeSpec.get(slug);

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
    }

    const outcomeSpec = data.slugToOutcomeSpec.get(slug);

    if (!outcomeSpec) return null;

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
  }, [data, slug]);

  useSpotMetas({
    // We only want to fetch spot meta for recurring events.
    // TODO: Check if we could enforce the restriction to recurring events where the class property is set to priceBinary.
    enabled: marketEventMeta?.type === "recurring",

    // We are just prefetching here, we don't want the component to re-render when the spot meta is updated.
    notifyOnChangeProps: [],
  });

  // TODO: use useSuspenseQuery in useMarketEvents so that we don't need to handle the loading state here.
  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error...</div>;

  if (!marketEventMeta) return notFound();

  return (
    <MarketEventStoreProvider marketEventMeta={marketEventMeta}>
      <MarketEventCtxProvider />
      {children}
    </MarketEventStoreProvider>
  );
};

export default MarketEventProvider;
