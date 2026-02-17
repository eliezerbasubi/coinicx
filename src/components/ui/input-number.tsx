import React, { useMemo } from "react";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

/**
 * Detects the decimal separator used by the user's locale.
 * Uses Intl.NumberFormat to determine the correct separator.
 * Examples:
 * - en-US, en-GB, ja-JP: "."
 * - fr-FR, de-DE, es-ES: ","
 * - ar-SA: "٫" (Arabic decimal separator)
 */
const getLocaleDecimalSeparator = (locale?: string): string => {
  const numberWithDecimal = 1.1;
  const formatted = new Intl.NumberFormat(locale ?? navigator.language).format(
    numberWithDecimal,
  );
  // Extract the character between 1 and 1 (the decimal separator)
  const match = formatted.match(/1(.+)1/);
  return match ? match[1] : ".";
};

/**
 * Common decimal separators used across different locales.
 * - Period (.) - used in US, UK, Japan, etc.
 * - Comma (,) - used in France, Germany, Spain, etc.
 * - Arabic decimal separator (٫)
 * - Middle dot (·) - used in some Catalan contexts
 */
const COMMON_DECIMAL_SEPARATORS = [".", ",", "٫", "·"];

/**
 * Builds a regex pattern to match digits and allowed decimal separators.
 */
const buildAllowedCharsRegex = (separators: string[]): RegExp => {
  const escapedSeparators = separators.map((s) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(`[^0-9${escapedSeparators.join("")}]`, "g");
};

/**
 * Normalizes any decimal separator to the target separator.
 */
const normalizeDecimalSeparator = (
  value: string,
  targetSeparator: string,
): string => {
  const separatorRegex = new RegExp(
    `[${COMMON_DECIMAL_SEPARATORS.map((s) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    ).join("")}]`,
    "g",
  );
  return value.replace(separatorRegex, targetSeparator);
};

/**
 * Converts a display value (with any locale separator) to a parseable value (with dot separator).
 * This is exported for use in components that need to parse the raw value.
 *
 * @example
 * const displayValue = "123,45"; // French format
 * const parseable = toParseableNumber(displayValue); // "123.45"
 * const number = parseFloat(parseable); // 123.45
 */
export const toParseableNumber = (displayValue: string): string => {
  return normalizeDecimalSeparator(displayValue, ".");
};

/**
 * Converts a parseable value (with dot separator) to a display value (with locale separator).
 * This is exported for use when setting values programmatically.
 *
 * @example
 * const parseable = "123.45";
 * const display = toDisplayNumber(parseable, "fr-FR"); // "123,45"
 */
export const toDisplayNumber = (
  parseableValue: string,
  locale?: string,
): string => {
  const localeSeparator = getLocaleDecimalSeparator(locale);
  return normalizeDecimalSeparator(parseableValue, localeSeparator);
};

const InputNumber = (props: Props) => {
  // Memoize the locale decimal separator to avoid recalculating on every render
  const { allowedCharsRegex, localeSeparator } = useMemo(
    () => ({
      localeSeparator: getLocaleDecimalSeparator(),
      allowedCharsRegex: buildAllowedCharsRegex(COMMON_DECIMAL_SEPARATORS),
    }),
    [],
  );

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      {...props}
      value={normalizeDecimalSeparator(
        props.value?.toString() || "",
        localeSeparator,
      )}
      onChange={(e) => {
        e.target.value = toParseableNumber(e.target.value);
        props.onChange?.(e);
      }}
      onInput={(e) => {
        const input = e.target as HTMLInputElement;

        // Remove all characters except digits and recognized decimal separators
        let value = input.value.replace(allowedCharsRegex, "");

        // Normalize all decimal separators to the locale separator
        value = normalizeDecimalSeparator(value, localeSeparator);

        // Prevent more than one decimal separator
        const parts = value.split(localeSeparator);
        if (parts.length > 2) {
          value = parts[0] + localeSeparator + parts.slice(1).join("");
        }

        // Prevent decimal separator at the start
        if (value.startsWith(localeSeparator)) {
          value = value.slice(localeSeparator.length);
        }

        input.value = value;

        props.onInput?.(e);
      }}
    />
  );
};

export default InputNumber;
