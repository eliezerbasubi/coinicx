"use client";

import React from "react";
import { notFound, redirect, RedirectType } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";
import PredictError from "@/features/predict/components/PredictError";
import PredictEventPageSkeleton from "@/features/predict/components/PredictEventPageSkeleton";
import { usePredictionsMetas } from "@/features/predict/hooks/usePredictionsMetas";
import { useSettledOutcome } from "@/features/predict/hooks/useSettledOutcome";
import { useSpotMetas } from "@/features/predict/hooks/useSpotMetas";
import MarketEventStoreProvider from "@/features/predict/lib/store/market-event/provider";
import { PredictionMetas } from "@/features/predict/lib/types";
import {
  mapOutcomeSpecToMarketEventMeta,
  mapQuestionToMarketEventMeta,
} from "@/features/predict/lib/utils/mapper";
import {
  parseOutcomeFromSlug,
  timeToExpiry,
} from "@/features/predict/lib/utils/parseMetadata";

import MarketEventCtxProvider from "./market-event-ctx-provider";
import UserPredictionProvider from "./user-prediction-provider";

type Props = {
  children: React.ReactNode;
  slug: string;
};

const MarketEventProvider = ({ children, slug }: Props) => {
  const { data, error, isLoading } = usePredictionsMetas();

  const baseMarketEventMeta = mapDataToMarketEventMeta(data, slug);

  // We only want to fetch settled outcome for recurring events that have expired.
  const hasExpired =
    !!baseMarketEventMeta &&
    !!baseMarketEventMeta.recurringPayload &&
    timeToExpiry(baseMarketEventMeta.recurringPayload.expiry) > 0;

  const outcomeId =
    hasExpired ||
    (!!baseMarketEventMeta && baseMarketEventMeta?.type !== "recurring")
      ? null
      : parseOutcomeFromSlug(slug);

  const { data: settledOutcome, isLoading: isSettledOutcomeLoading } =
    useSettledOutcome({
      outcomeId,
    });

  const marketEventMeta = settledOutcome ?? baseMarketEventMeta;

  useSpotMetas({
    // We only want to fetch spot meta for recurring events.
    // TODO: Check if we could enforce the restriction to recurring events where the class property is set to priceBinary.
    enabled: marketEventMeta?.type === "recurring",

    // We are just prefetching here, we don't want the component to re-render when the spot meta is updated.
    notifyOnChangeProps: [],
  });

  if (isLoading || isSettledOutcomeLoading) return <PredictEventPageSkeleton />;

  // If the settled outcome is not found, it means the event is not settled or it doesn't exist.
  // If we have an error, we should show the error page.
  if (error && !settledOutcome) {
    return (
      <PredictError
        title="Something went wrong"
        description="We're having trouble loading market events. Please try again later."
      />
    );
  }

  if (!marketEventMeta) return notFound();

  return (
    <MarketEventStoreProvider marketEventMeta={marketEventMeta}>
      <MarketEventCtxProvider />
      <UserPredictionProvider>{children}</UserPredictionProvider>
    </MarketEventStoreProvider>
  );
};

export default MarketEventProvider;

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
};
