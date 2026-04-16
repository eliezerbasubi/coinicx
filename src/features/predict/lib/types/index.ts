import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

export interface SideSpecCtx {
  /** The volume of the side spec */
  volume: number;

  /** The volume of the side spec in base currency */
  volumeInBase: number;
  markPx: number;
  midPx: number;
  prevDayPx: number;

  /** The sum of the open interest of the two sides. Circulating supply of the market event */
  openInterest: number;
}

export interface SideSpec extends SideSpecCtx {
  name: string;
  coin: string;
}

export interface MarketOutcome {
  coin: string;
  outcome: number;
  title: string;
  description: string;
  sides: SideSpec[];
  status: MarketEventStatus;
}

export interface ParsedRecurringPayload {
  class: string;
  underlying: string;
  expiry: string;
  targetPrice: string;
  period: string;
}

export interface ParsedRecurringMetadata extends ParsedRecurringPayload {
  title: string;
  slug: string;
  description: string;
}

export type MarketEventStatus = "active" | "settled";

export interface MarketEvent {
  title: string;
  description: string;
  slug: string;
  volume: number;

  /** The sum of the open interest of the two sides. Circulating supply of the market event */
  openInterest: number;

  /** The identifier of the outcome. Only applicable for binary and recurring events */
  coin: string | null;

  /** `question` property in the questions array. Position of the question in the questions array */
  questionId: number | null;

  /** The outcome ID */
  outcome: number;

  /** The type of market event.
   * `recurring` is a binary event that will be settled at a future date.
   * `binary` is a binary event that will be settled at a future date.
   * `categorical` is a market event with more than two outcomes. */
  type: "recurring" | "binary" | "categorical";

  /** The side specs of the market event. Only applicable for binary and recurring events */
  sides: SideSpec[];

  /** The binary outcomes of the market event. Only applicable for categorical events. */
  outcomes: MarketOutcome[];

  /** The settled outcomes of the market event. Only applicable for categorical events */
  settledOutcomes: number[];

  /** The categories of the market event. */
  categories: string[];

  /** The status of the market event. */
  status: MarketEventStatus;
}

export interface MarketEventMetaSide {
  name: string;
  coin: string;
}

export interface MarketEventMetaOutcome extends Omit<MarketOutcome, "sides"> {
  sides: MarketEventMetaSide[];
}

export type MarketEventType = "recurring" | "binary" | "categorical";

export interface MarketEventMeta {
  title: string;
  description: string;
  slug: string;
  coin: string | null;
  questionId: number | null;
  outcome: number;
  type: MarketEventType;
  sides: MarketEventMetaSide[];
  outcomes: MarketEventMetaOutcome[];
  settledOutcomes: number[];
  categories: string[];
  recurringPayload: ParsedRecurringPayload | null;
  status: MarketEventStatus;
  settledSide?: number;
  settledDetails?: { [key: string]: string } | null;
}

export interface MarketEventCtx {
  openInterest: number;
  volume: number;
  outcomes: { sides: SideSpecCtx[] }[];
  sides: SideSpecCtx[];
}

export type PredictionMetas = {
  slugToOutcomeSpec: Map<string, OutcomeMetaResponse["outcomes"][number]>;
  slugToQuestionSpec: Map<string, OutcomeMetaResponse["questions"][number]>;
  outcomeToQuestionMeta: Map<
    number,
    {
      question: number;
      slug: string;
    }
  >;
  outcomeToSlug: Map<number, string>;
  fallbackOutcomes: Set<number>;
};
