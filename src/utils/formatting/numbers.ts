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

export const formatInputValue = (value: string, options?: FormatOptions) => {
  if (!value) return "";

  const formatted = formatNumber(Number(value), options);

  // if (value.endsWith(".")) {
  //   formatted += ".";
  // }

  return formatted;
};

/**
 * @deprecated Use formatNumber with useFallback set to true
 */
export const formatNumberWithFallback = (
  value: number,
  options?: FormatOptions,
  fallback?: string,
) => {
  if (!value || !Number.isFinite(value)) return fallback ?? "--";

  return formatNumber(value, options);
};
