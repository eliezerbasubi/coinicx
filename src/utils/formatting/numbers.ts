export type FormatOptions = {
  locale?: string;
  useSign?: boolean;
  useFallback?: boolean;
  fallback?: string;
  symbol?: string | null;
} & Intl.NumberFormatOptions;

export const formatNumber = (value: number, options?: FormatOptions) => {
  const { locale, useSign, useFallback, fallback, symbol, ...rest } =
    options ?? {};

  const formatted = value.toLocaleString(locale ?? "en-US", {
    ...rest,
    currency: rest.currency ?? "USD",
  });

  const suffix = symbol ? ` ${symbol}` : "";

  if (useFallback && (!value || !Number.isFinite(value))) {
    return (fallback ?? "--") + suffix;
  }

  if (useSign) {
    const sign = value >= 0 ? "+" : "";

    return sign + formatted + suffix;
  }

  return formatted + suffix;
};
