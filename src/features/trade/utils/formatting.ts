import { formatNumber, FormatOptions } from "@/utils/formatting/numbers";

export const formatSymbol = (base: string, quote: string, isSpot: boolean) => {
  if (isSpot) {
    return `${base}/${quote}`;
  }
  return `${base}-${quote}`;
};

export const formatPriceToDecimal = (
  px: number,
  decimals: number | null,
  options?: FormatOptions,
) => {
  return formatNumber(px, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 10,
    ...options,
  });
};
