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

  // /** The underlying asset of the market event. Only applicable for recurring events */
  // underlyingAsset: string | null;

  // /** The period of the market event. Only applicable for recurring events */
  // period: string | null;
}

// export interface MarketEvent extends MarketEventMeta {
//   volume: number;
//   openInterest: number;
//   markPx: number;
//   midPx: number;
// }
