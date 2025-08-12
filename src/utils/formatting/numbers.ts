export const formatNumber = (
  value: number,
  options?: { locale?: string } & Intl.NumberFormatOptions,
) => {
  const { locale, ...rest } = options ?? {};
  return value.toLocaleString(locale ?? "en-US", {
    ...rest,
    currency: rest.currency ?? "USD",
  });
};

export const formatInputValue = (
  value: string,
  options?: { locale?: string } & Intl.NumberFormatOptions,
) => {
  let formatted = formatNumber(Number(value), options);

  if (value.endsWith(".")) {
    formatted += ".";
  }

  return formatted;
};
