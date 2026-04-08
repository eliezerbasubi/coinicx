import { useMemo } from "react";

import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";

import { MarketEvent, SideSpec } from "../types";
import { detectCategories } from "../utils/detectCategories";
import { buildSideCoin, isRecurring } from "../utils/outcomes";
import { parseReccuringTitle } from "../utils/parseMetadata";
import { slugify } from "../utils/shared";
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
    for (const question of data.questions) {
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
    for (const outcome of data.outcomes) {
      // Skip "Other" outcomes with "N/A" description as it's considered as a fallback outcome
      if (outcome.name === "Other" && outcome.description === "N/A") continue;

      const coin = buildSideCoin(outcome.outcome, 0);
      const ctx = spotAssetCtxs[coin];

      // Check if the outcome is a categorical outcome
      const categoricalEventIndex = questionOutcomes.get(outcome.outcome);

      if (categoricalEventIndex !== undefined) {
        const categoricalEvent = marketEvents[categoricalEventIndex];

        const sides = outcome.sideSpecs.map((sideSpec, index) => {
          const side = mapSideSpecToSide(sideSpec.name, outcome.outcome, index);

          categoricalEvent.volume += side.volume;
          categoricalEvent.openInterest += side.openInterest;

          return side;
        });

        categoricalEvent.outcomes.push({
          coin: buildSideCoin(outcome.outcome, 0),
          outcome: outcome.outcome,
          title: outcome.name,
          description: outcome.description,
          sides,
        });
      }
      // Check if the outcome is a recurring outcome
      else if (isRecurring(outcome)) {
        const { title, slug } = parseReccuringTitle(outcome);

        const sides = outcome.sideSpecs.map((sideSpec, index) =>
          mapSideSpecToSide(sideSpec.name, outcome.outcome, index),
        );

        marketEvents.push({
          coin: buildSideCoin(outcome.outcome, 0),
          title,
          description: outcome.description,
          slug,
          resolution: outcome.outcome,
          type: "recurring",
          questionId: null,
          volume: Number(ctx?.dayNtlVlm ?? 0),
          openInterest: sides[0].openInterest + sides[1].openInterest,
          outcomes: [],
          settledOutcomes: [],
          categories: detectCategories(outcome.name, outcome.description),
          sides,
        });
      }
      // Consider the rest binary outcomes
      else {
        const sides = outcome.sideSpecs.map((sideSpec, index) =>
          mapSideSpecToSide(sideSpec.name, outcome.outcome, index),
        );

        marketEvents.push({
          coin: buildSideCoin(outcome.outcome, 0),
          title: outcome.name,
          description: outcome.description,
          slug: slugify(outcome.name),
          resolution: outcome.outcome,
          type: "binary",
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
