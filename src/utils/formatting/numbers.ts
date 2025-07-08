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
