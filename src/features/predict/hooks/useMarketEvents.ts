import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import {
  MarketEvent,
  MarketEventMeta,
  SideSpec,
} from "@/features/predict/lib/types";
import { detectCategories } from "@/features/predict/lib/utils/detectCategories";
import {
  buildSideCoin,
  isRecurring,
} from "@/features/predict/lib/utils/outcomes";
import {
  parseReccuringTitle,
  parseRecurringMetadata,
} from "@/features/predict/lib/utils/parseMetadata";
import { slugify } from "@/features/predict/lib/utils/shared";

import { PredictionMetas } from "../lib/queries";
import { usePredictionsMetas } from "./usePredictionsMetas";

export const useMarketEventsMetas = () => {
  const { data, isLoading, error } = usePredictionsMetas();

  const meta = mapDataToMarketEventsMetas(data);

  return {
    data: meta.marketEvents,
    categories: meta.categories,
    isLoading,
    error,
  };
};

export const useMarketEvents = () => {
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const { data, categories, isLoading, error } = useMarketEventsMetas();

  const mapSideSpecToSide = (
    sideName: string,
    outcome: number,
    index: number,
  ): SideSpec => {
    const sideCoin = buildSideCoin(outcome, index);
    const ctx = spotAssetCtxs[sideCoin];

    return {
      name: sideName,
      coin: sideCoin,
      volume: Number(ctx?.dayNtlVlm ?? 0),
      volumeInBase: Number(ctx?.dayBaseVlm ?? 0),
      markPx: Number(ctx?.markPx ?? 0),
      midPx: Number(ctx?.midPx ?? 0),
      prevDayPx: Number(ctx?.prevDayPx ?? 0),
      openInterest: Number(ctx?.circulatingSupply ?? 0),
    };
  };

  const marketEvents = useMemo<MarketEvent[]>(() => {
    return data.map((marketEventMeta) => {
      // Add context data to question based outcome
      if (!marketEventMeta.coin) {
        let volume = 0;
        let openInterest = 0;

        const outcomes = marketEventMeta.outcomes.map((outcome) => {
          const sides = outcome.sides.map((sideSpec, index) => {
            const side = mapSideSpecToSide(
              sideSpec.name,
              outcome.outcome,
              index,
            );

            // Open interest is the total of both sides
            openInterest += side.openInterest;

            return side;
          });

          // Consider the first side spec as the main side spec cause it has the same coin as the outcome
          volume += sides[0].volume;

          return {
            ...outcome,
            sides,
          };
        });

        return {
          ...marketEventMeta,
          volume,
          openInterest,
          sides: [],
          outcomes,
        };
      }

      // Add context data to binary and recurring outcomes

      const ctx = spotAssetCtxs[marketEventMeta.coin];

      return {
        ...marketEventMeta,
        outcomes: [],
        sides: marketEventMeta.sides.map((side, index) =>
          mapSideSpecToSide(side.name, marketEventMeta.resolution, index),
        ),
        volume: Number(ctx?.dayNtlVlm ?? 0),
        openInterest: Number(ctx?.circulatingSupply ?? 0),
      };
    });
  }, [data, spotAssetCtxs]);

  return { marketEvents, categories, isLoading, error };
};

const mapDataToMarketEventsMetas = (data: PredictionMetas) => {
  const categories: string[] = [];

  const marketEvents: MarketEventMeta[] = [];

  if (!data) return { marketEvents, categories };

  // Create a map of question outcomes.
  // The key is the outcome ID and the value is the index of the categorical event in the marketEventsMeta array.
  const questionOutcomes = new Map<number, number>();

  // Populate the map of question outcomes
  for (const question of data.slugToQuestionSpec.values()) {
    const questionCategories = detectCategories(
      question.name,
      question.description,
    );

    // Add categories to the global categories list
    categories.push(...questionCategories);

    const categoricalEventIndex = marketEvents.push({
      coin: null,
      title: question.name,
      description: "",
      slug: slugify(question.name),
      resolution: question.fallbackOutcome,
      type: "categorical",
      questionId: question.question,
      settledOutcomes: question.settledNamedOutcomes,
      categories: questionCategories,
      sides: [],
      outcomes: [],
      recurringPayload: null,
    });

    for (const outcome of question.namedOutcomes) {
      questionOutcomes.set(outcome, categoricalEventIndex - 1);
    }
  }

  // Map through outcomes to create market events
  for (const outcome of data.slugToOutcomeSpec.values()) {
    // Skip fallback outcomes
    if (data.fallbackOutcomes.has(outcome.outcome)) continue;

    // Check if the outcome is a categorical outcome
    const categoricalEventIndex = questionOutcomes.get(outcome.outcome);

    if (categoricalEventIndex !== undefined) {
      const categoricalEvent = marketEvents[categoricalEventIndex];

      const sides = outcome.sideSpecs.map((sideSpec, index) => ({
        name: sideSpec.name,
        coin: buildSideCoin(outcome.outcome, index),
      }));

      categoricalEvent.outcomes.push({
        coin: buildSideCoin(outcome.outcome, 0),
        outcome: outcome.outcome,
        title: outcome.name,
        description: "",
        sides,
      });
    } else {
      const isRecurringOutcome = isRecurring(outcome);
      const parsedMetadata = isRecurringOutcome
        ? parseRecurringMetadata(outcome.description, outcome.outcome)
        : { title: outcome.name, slug: slugify(outcome.name), period: null };

      const outcomeCategories = detectCategories(
        outcome.name,
        outcome.description,
      );

      // Add categories to the global categories list
      categories.push(...outcomeCategories);

      // For recurring outcome, push the periodic category to first positions
      if (parsedMetadata.period) {
        const recurringCategory = `crypto_${parsedMetadata.period}`;
        outcomeCategories.push(recurringCategory);

        categories.unshift(recurringCategory);
      }

      const sides = outcome.sideSpecs.map((sideSpec, index) => ({
        name: sideSpec.name,
        coin: buildSideCoin(outcome.outcome, index),
      }));

      marketEvents.push({
        coin: buildSideCoin(outcome.outcome, 0),
        title: parsedMetadata.title,
        description: "",
        slug: parsedMetadata.slug,
        resolution: outcome.outcome,
        type: isRecurringOutcome ? "recurring" : "binary",
        questionId: null,
        recurringPayload: null,
        outcomes: [],
        settledOutcomes: [],
        categories: outcomeCategories,
        sides,
      });
    }
  }

  return { marketEvents, categories: [...new Set(categories)] };
};
