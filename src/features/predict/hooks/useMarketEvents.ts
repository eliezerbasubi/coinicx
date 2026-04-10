import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";

import { MarketEvent, SideSpec } from "../lib/types";
import { detectCategories } from "../lib/utils/detectCategories";
import { buildSideCoin, isRecurring } from "../lib/utils/outcomes";
import { parseReccuringTitle } from "../lib/utils/parseMetadata";
import { slugify } from "../lib/utils/shared";
import { useMarketEventsMetas } from "./useMarketEventsMetas";

export const useMarketEvents = () => {
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);
  const { data, isLoading, error } = useMarketEventsMetas();

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
    const marketEvents: MarketEvent[] = [];

    if (!data) return marketEvents;

    // Create a map of question outcomes.
    // The key is the outcome ID and the value is the index of the categorical event in the marketEventsMeta array.
    const questionOutcomes = new Map<number, number>();

    // Populate the map of question outcomes
    for (const question of data.slugToQuestion.values()) {
      const categoricalEventIndex = marketEvents.push({
        coin: null,
        title: question.name,
        description: question.description,
        slug: slugify(question.name),
        resolution: question.fallbackOutcome,
        type: "categorical",
        questionId: question.question,
        volume: 0,
        openInterest: 0,
        settledOutcomes: question.settledNamedOutcomes,
        categories: detectCategories(question.name, question.description),
        sides: [],
        outcomes: [], // We will populate this later in the outcomes loop
      });

      for (const outcome of question.namedOutcomes) {
        questionOutcomes.set(outcome, categoricalEventIndex - 1);
      }
    }

    // Map through outcomes to create market events
    for (const outcome of data.slugToOutcomeSpec.values()) {
      // Skip fallback outcomes
      if (data.fallbackOutcomes.has(outcome.outcome)) continue;

      const coin = buildSideCoin(outcome.outcome, 0);
      const ctx = spotAssetCtxs[coin];

      // Check if the outcome is a categorical outcome
      const categoricalEventIndex = questionOutcomes.get(outcome.outcome);

      if (categoricalEventIndex !== undefined) {
        const categoricalEvent = marketEvents[categoricalEventIndex];

        const sides = outcome.sideSpecs.map((sideSpec, index) => {
          const side = mapSideSpecToSide(sideSpec.name, outcome.outcome, index);

          // Open interest is the total of both sides
          categoricalEvent.openInterest += side.openInterest;

          return side;
        });

        // Consider the first side spec as the main side spec cause it has the same coin as the outcome
        categoricalEvent.volume += sides[0].volume;

        categoricalEvent.outcomes.push({
          coin: buildSideCoin(outcome.outcome, 0),
          outcome: outcome.outcome,
          title: outcome.name,
          description: outcome.description,
          sides,
        });
      } else {
        const isRecurringOutcome = isRecurring(outcome);
        const parsedMetadata = isRecurringOutcome
          ? parseReccuringTitle(outcome)
          : { title: outcome.name, slug: slugify(outcome.name) };

        const sides = outcome.sideSpecs.map((sideSpec, index) =>
          mapSideSpecToSide(sideSpec.name, outcome.outcome, index),
        );

        marketEvents.push({
          coin: buildSideCoin(outcome.outcome, 0),
          title: parsedMetadata.title,
          // Don't parse description
          description: outcome.description,
          slug: parsedMetadata.slug,
          resolution: outcome.outcome,
          type: isRecurringOutcome ? "recurring" : "binary",
          questionId: null,
          volume: Number(ctx?.dayNtlVlm ?? 0),
          openInterest: sides[0].openInterest + sides[1].openInterest,
          outcomes: [],
          settledOutcomes: [],
          categories: detectCategories(outcome.name, outcome.description),
          sides,
        });
      }
    }

    return marketEvents;
  }, [spotAssetCtxs, data]);

  const getMarketEventBySlug = (slug: string) => {
    return marketEvents.find((event) => event.slug === slug);
  };

  return { marketEvents, isLoading, error, getMarketEventBySlug };
};
