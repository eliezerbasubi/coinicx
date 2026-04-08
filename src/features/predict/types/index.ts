export interface SideSpec {
  name: string;
  coin: string;

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

export interface MarketOutcome {
  coin: string;
  outcome: number;
  title: string;
  description: string;
  sides: SideSpec[];
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
  description: string;
}

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

  /** The outcome ID that will be settled */
  resolution: number;

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
}

interface MarketEventMetaSide {
  name: string;
  token?: number;
}

export interface MarketEventMetaOutcome {
  coin: string;
  title: string;
  sides: MarketEventMetaSide[];
}

export interface MarketEventMeta {
  title: string;
  description: string;
  slug: string;
  coin: string | null;
  questionId: number | null;
  resolution: number;
  type: "recurring" | "binary" | "categorical";
  sides: MarketEventMetaSide[];
  outcomes: MarketEventMetaOutcome[];
  settledOutcomes: number[];
  categories: string[];
  recurringPayload: ParsedRecurringPayload | null;
}

export interface MarketEventCtx {
  openInterest: number;
  volume: number;
  sides: {
    volume: number;
    volumeInBase: number;
    markPx: number;
    midPx: number;
    prevDayPx: number;
    openInterest: number;
  }[];
}
