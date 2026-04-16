"use client";

import React, { useEffect } from "react";
import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import { QUERY_KEYS } from "@/lib/constants/queryKeys";
import { hlSubClient } from "@/lib/services/transport";
import { getQueryClient } from "@/lib/utils/getQueryClient";
import { useSubscription } from "@/hooks/useSubscription";

type Props = {
  children: React.ReactNode;
};

const payload = {
  type: "outcomeMetaUpdates",
};

type OutcomeSpec = OutcomeMetaResponse["outcomes"][number];
type QuestionSpec = OutcomeMetaResponse["questions"][number];

type OutcomeCreated = {
  outcomeCreated: OutcomeSpec;
};

type OutcomeSettled = {
  outcomeSettled: number;
};

type QuestionUpdated = {
  questionUpdated: QuestionSpec;
};

type QuestionSettled = {
  questionSettled: number;
};

type OutcomeMetaUpdate = (
  | OutcomeCreated
  | OutcomeSettled
  | QuestionUpdated
  | QuestionSettled
)[];

type SettleOutcomeSpec = {
  spec: {
    outcome: number;
    name: string;
    description: string;
    sideSpecs: { name: string }[];
  };
  settleFraction: string;
  details: string;
};

const MarketEventsSubscriptions = ({ children }: Props) => {
  useSubscription(() => {
    const queryClient = getQueryClient();

    return hlSubClient.config_.transport.subscribe<OutcomeMetaUpdate>(
      payload.type,
      payload,
      (data) => {
        const predictionMarketEvents =
          queryClient.getQueryData<OutcomeMetaResponse>([
            QUERY_KEYS.predictionMarketEvents,
          ]);

        if (!predictionMarketEvents) return;

        let { outcomes, questions } = predictionMarketEvents;

        for (const update of data.detail) {
          // If created, add the new outcome to the list of outcomes.
          if ("outcomeCreated" in update) {
            const newOutcome = update.outcomeCreated;

            const exists = outcomes.some(
              (o) => o.outcome === newOutcome.outcome,
            );

            if (!exists) {
              outcomes = [...outcomes, newOutcome];
            }
          }
          // If settled, remove the outcome from the list of outcomes.
          else if ("outcomeSettled" in update) {
            const settledOutcome = update.outcomeSettled;

            const foundOutcome = outcomes.find(
              (o) => o.outcome === settledOutcome,
            );

            if (foundOutcome) {
              outcomes = outcomes.filter((o) => o.outcome !== settledOutcome);

              queryClient.prefetchQuery<SettleOutcomeSpec>({
                queryKey: [QUERY_KEYS.settledOutcome, settledOutcome],
                initialData: {
                  spec: foundOutcome,
                  settleFraction: "1",
                  details: "",
                },
              });
            } else {
              // Invalidate the settled outcome query to update the UI.
              queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.settledOutcome, settledOutcome],
              });
            }
          }
          // If updated, update the question in the list of questions.
          else if ("questionUpdated" in update) {
            const updatedQuestion = update.questionUpdated;

            const index = questions.findIndex(
              (q) => q.question === updatedQuestion.question,
            );

            if (index >= 0) {
              questions = questions.map((q, i) =>
                i === index ? updatedQuestion : q,
              );
            } else {
              questions = [...questions, updatedQuestion];
            }
          }
          // If settled, remove the question and its outcomes from the list of questions and outcomes.
          else if ("questionSettled" in update) {
            const settledQuestionId = update.questionSettled;

            const question = questions.find(
              (q) => q.question === settledQuestionId,
            );

            if (question) {
              const outcomesToRemove = new Set([
                ...question.namedOutcomes,
                question.fallbackOutcome,
              ]);

              outcomes = outcomes.filter(
                (o) => !outcomesToRemove.has(o.outcome),
              );

              questions = questions.filter(
                (q) => q.question !== settledQuestionId,
              );
            }
          }

          queryClient.setQueryData<OutcomeMetaResponse>(
            [QUERY_KEYS.predictionMarketEvents],
            (prev) => {
              if (!prev) return;
              return {
                ...prev,
                outcomes,
                questions,
              };
            },
          );
        }
      },
    );
  }, []);

  // Refetch the prediction market events when the connection is ready.
  // This is to ensure that we have the latest data when the connection is established.
  useEffect(() => {
    const queryClient = getQueryClient();

    hlSubClient.config_.transport.ready().then(() => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.predictionMarketEvents],
        refetchType: "inactive",
      });
    });
  }, []);

  return children;
};

export default MarketEventsSubscriptions;
