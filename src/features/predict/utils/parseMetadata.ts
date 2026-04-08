import { OutcomeMetaResponse } from "@nktkas/hyperliquid";

import { ParsedRecurringMetadata, ParsedRecurringPayload } from "../types";
import { slugify } from "./shared";

export function formatExpiryDate(
  expiry: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = parseExpiry(expiry);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "numeric",
    hour12: true,
  };

  const formatterOptions = options ?? defaultOptions;

  const formatter = new Intl.DateTimeFormat("en-US", formatterOptions);

  return formatter.format(date);
}

export function parseExpiry(s: string): Date {
  const year = parseInt(s.slice(0, 4));
  const month = parseInt(s.slice(4, 6)) - 1;
  const day = parseInt(s.slice(6, 8));
  const hour = parseInt(s.slice(9, 11));
  const min = parseInt(s.slice(11, 13));
  return new Date(Date.UTC(year, month, day, hour, min));
}

/** Minutes until market expires. Negative means already expired. */
export function timeToExpiry(expiry: string): number {
  return (parseExpiry(expiry).getTime() - Date.now()) / 60_000;
}

/**
 * Parse a period string to minutes.
 * "1m"→1, "5m"→5, "15m"→15, "1h"→60, "4h"→240, "1d"→1440
 */
export function convertPeriodToMinutes(period: string): number {
  const match = period.match(/^(\d+)(m|h|d)$/);
  if (!match) return 15;

  const value = parseInt(match[1]);
  switch (match[2]) {
    case "m":
      return value;
    case "h":
      return value * 60;
    case "d":
      return value * 1440;
    default:
      return 15;
  }
}

export const formatDateFromPeriod = (
  period: string,
  expiry: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const minutes = convertPeriodToMinutes(period);
  const date = parseExpiry(expiry);

  const expiryDate = new Date(date.getTime() + minutes * 60 * 1000);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formatterOptions = options ?? defaultOptions;

  const formatter = new Intl.DateTimeFormat("en-US", formatterOptions);

  return formatter.format(expiryDate);
};

/** Parse "class:priceBinary|underlying:BTC|expiry:20260311-0300|targetPrice:69070|period:1d" */
export function parseRecurringDescription(
  description: string,
): ParsedRecurringPayload | null {
  if (!description.includes("|")) return null;
  const result: ParsedRecurringPayload = {
    class: "",
    underlying: "",
    expiry: "",
    targetPrice: "",
    period: "",
  };

  for (const segment of description.split("|")) {
    const [key, ...rest] = segment.split(":");
    if (key && rest.length > 0) {
      result[key as keyof ParsedRecurringPayload] = rest.join(":");
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

export function formatRecurringTitle(
  outcomeId: number,
  recurringPayload?: ParsedRecurringPayload | null,
) {
  if (!recurringPayload)
    return {
      title: `Outcome #${outcomeId}`,
      slug: slugify(`Outcome-${outcomeId}`),
    };

  const underlying = recurringPayload.underlying ?? "???";
  const target = recurringPayload.targetPrice ?? "???";
  const expiry = recurringPayload.expiry ?? "";

  if (recurringPayload.class === "priceBinary") {
    return {
      title: `${underlying} above $${target} on ${formatExpiryDate(expiry)}?`,
      slug: slugify(
        `${underlying} above ${target} on ${formatExpiryDate(expiry, { month: "short", day: "numeric" })}`,
      ),
    };
  }
  return {
    title: `${underlying} ${recurringPayload.class ?? "outcome"} (${formatExpiryDate(expiry)})?`,
    slug: slugify(
      `${underlying} ${recurringPayload.class ?? "outcome"} ${formatExpiryDate(expiry, { month: "short", day: "numeric" })}`,
    ),
  };
}

export function formatRecurringDescription(
  description: string,
  recurringPayload?: ParsedRecurringPayload,
): string {
  if (!recurringPayload) return description;

  const expiry = recurringPayload.expiry ?? "unknown";

  return `If the ${recurringPayload.underlying} mark price at time of settlement is above ${recurringPayload.targetPrice} at ${formatExpiryDate(expiry)}, YES tokens pay out $1 each. Otherwise, NO tokens pay out $1 each.`;
}

export function parseReccuringTitle(
  outcome: OutcomeMetaResponse["outcomes"][number],
) {
  const reccuringPayload = parseRecurringDescription(outcome.description);

  return formatRecurringTitle(outcome.outcome, reccuringPayload);
}

/** Parse the metadata of a recurring outcome */
export function parseRecurringMetadata(
  description: string,
  outcomeId: number,
): ParsedRecurringMetadata {
  const parsed = parseRecurringDescription(description);

  if (!parsed) {
    return {
      ...formatRecurringTitle(outcomeId),
      description: formatRecurringDescription(description),
      class: "",
      underlying: "",
      expiry: "",
      targetPrice: "",
      period: "",
    };
  }

  return {
    ...formatRecurringTitle(outcomeId, parsed),
    description: formatRecurringDescription(description, parsed),
    ...parsed,
  };
}
