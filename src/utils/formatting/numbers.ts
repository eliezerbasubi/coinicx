export type FormatOptions = { locale?: string } & Intl.NumberFormatOptions;

export const formatNumber = (value: number, options?: FormatOptions) => {
  const { locale, ...rest } = options ?? {};
  return value.toLocaleString(locale ?? "en-US", {
    ...rest,
    currency: rest.currency ?? "USD",
  });
};

export const formatInputValue = (value: string, options?: FormatOptions) => {
  if (!value) return "";

  let formatted = formatNumber(Number(value), options);

  if (value.endsWith(".")) {
    formatted += ".";
  }

  return formatted;
};

export const formatNumberWithFallback = (
  value: number,
  options?: FormatOptions,
  fallback?: string,
) => {
  if (!value || !Number.isFinite(value)) return fallback ?? "--";

  return formatNumber(value, options);
};
