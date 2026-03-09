export type FormatOptions = {
  locale?: string;
  useSign?: boolean;
  useFallback?: boolean;
  fallback?: string;
} & Intl.NumberFormatOptions;

export const formatNumber = (value: number, options?: FormatOptions) => {
  const { locale, useSign, useFallback, fallback, ...rest } = options ?? {};

  const formatted = value.toLocaleString(locale ?? "en-US", {
    ...rest,
    currency: rest.currency ?? "USD",
  });

  if (useFallback && (!value || !Number.isFinite(value))) {
    return fallback ?? "--";
  }

  if (useSign) {
    const sign = value >= 0 ? "+" : "";

    return sign + formatted;
  }

  return formatted;
};
