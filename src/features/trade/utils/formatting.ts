import { formatNumber, FormatOptions } from "@/lib/utils/formatting/numbers";

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

export const formatSize = (rawSize: string | number, szDecimals: number) => {
  return removeTrailingZeros(Math.abs(Number(rawSize)).toFixed(szDecimals));
};

export const removeTrailingZeros = (value: string) => {
  if (!value.includes(".")) return value;

  const [intPart, fracPart] = value.split(".");
  const newFrac = fracPart.replace(/0+$/, "");

  return newFrac ? `${intPart}.${newFrac}` : intPart;
};
