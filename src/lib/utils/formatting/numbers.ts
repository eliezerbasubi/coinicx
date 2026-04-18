export type FormatOptions = {
  locale?: string;
  useSign?: boolean;
  useFallback?: boolean;
  fallback?: string;
  symbol?: string | null;
} & Omit<Intl.NumberFormatOptions, "style"> & {
    style?: Intl.NumberFormatOptions["style"] | "cent";
  };

export const formatNumber = (value: number, options?: FormatOptions) => {
  const { locale, useSign, useFallback, fallback, symbol, style, ...rest } =
    options ?? {};

  let formattedValue = value;

  if (style === "cent") {
    formattedValue = value * 100;
  }

  const formatted = formattedValue.toLocaleString(locale ?? "en-US", {
    ...rest,
    style: style === "cent" ? undefined : style,
    currency: rest.currency ?? "USD",
  });

  let suffix = symbol ? ` ${symbol}` : "";

  if (style && style === "cent") {
    suffix = "¢";
  }

  if (useFallback && (!value || !Number.isFinite(value))) {
    return (fallback ?? "--") + suffix;
  }

  if (useSign) {
    const sign = value >= 0 ? "+" : "";

    return sign + formatted + suffix;
  }

  return formatted + suffix;
};
