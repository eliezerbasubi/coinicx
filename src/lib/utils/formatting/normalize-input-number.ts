/**
 * Detects the decimal separator used by the user's locale.
 * Uses Intl.NumberFormat to determine the correct separator.
 * Examples:
 * - en-US, en-GB, ja-JP: "."
 * - fr-FR, de-DE, es-ES: ","
 * - ar-SA: "٫" (Arabic decimal separator)
 */
export const getLocaleDecimalSeparator = (locale?: string): string => {
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
export const COMMON_DECIMAL_SEPARATORS = [".", ",", "٫", "·"];

/**
 * Builds a regex pattern to match digits and allowed decimal separators.
 */
export const buildAllowedCharsRegex = (separators: string[]): RegExp => {
  const escapedSeparators = separators.map((s) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(`[^0-9${escapedSeparators.join("")}]`, "g");
};

/**
 * Normalizes any decimal separator to the target separator.
 */
export const normalizeDecimalSeparator = (
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
 * Converts a locale-formatted display value to a parseable value (with dot decimal separator).
 * Locale-aware: strips the group (thousands) separator first, then replaces the
 * locale decimal separator with ".".
 *
 * @example
 * // en-US / en-GB (group: ",", decimal: ".")
 * toParseableNumber("70,000")     // "70000"
 * toParseableNumber("70,000.78")  // "70000.78"
 *
 * // fr-FR (group: " ", decimal: ",")
 * toParseableNumber("70 000,78")  // "70000.78"
 *
 * // de-DE (group: ".", decimal: ",")
 * toParseableNumber("70.000,78")  // "70000.78"
 */
export const toParseableNumber = (
  displayValue: string,
): string => {
  const groupSep = getLocaleGroupSeparator();
  const decimalSep = getLocaleDecimalSeparator();

  // Strip group separators first (e.g. "," in en-US, "." in de-DE)
  let value = stripGroupSeparators(displayValue, groupSep);

  // Replace locale decimal separator with "."
  if (decimalSep !== ".") {
    const escaped = decimalSep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    value = value.replace(new RegExp(escaped, "g"), ".");
  }

  return value;
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

/**
 * Detects the group (thousands) separator used by the user's locale.
 * Examples:
 * - en-US, en-GB: ","
 * - fr-FR: " " (narrow no-break space)
 * - de-DE: "."
 */
export const getLocaleGroupSeparator = (locale?: string): string => {
  const formatted = new Intl.NumberFormat(locale ?? navigator.language).format(
    10000,
  );
  const match = formatted.match(/\d(\D+)\d/);
  return match?.[1] ?? "";
};

/**
 * Strips group (thousands) separators from a value string.
 */
export const stripGroupSeparators = (
  value: string,
  groupSeparator: string,
): string => {
  if (!groupSeparator) return value;
  const escaped = groupSeparator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(new RegExp(escaped, "g"), "");
};

/**
 * Formats a raw parseable value (dot decimal) with locale-aware thousand grouping.
 * Preserves the decimal part as-is (no rounding/truncation of user input).
 *
 * @example
 * formatWithGrouping("1234.56")    // "1,234.56" (en-GB)
 * formatWithGrouping("1234.56", "fr-FR") // "1 234,56"
 * formatWithGrouping("1234.")      // "1,234." (trailing decimal preserved)
 */
export const formatWithGrouping = (
  rawValue: string,
  locale?: string,
): string => {
  if (!rawValue) return "";

  const decimalSep = getLocaleDecimalSeparator(locale);
  const resolvedLocale = locale ?? navigator.language;

  const dotIndex = rawValue.indexOf(".");
  const integerStr =
    dotIndex >= 0 ? rawValue.substring(0, dotIndex) : rawValue;
  const decimalStr =
    dotIndex >= 0 ? rawValue.substring(dotIndex + 1) : null;

  if (integerStr === "") return rawValue;

  const intNum = parseInt(integerStr, 10);
  if (isNaN(intNum)) return rawValue;

  const formattedInt = new Intl.NumberFormat(resolvedLocale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(intNum);

  if (decimalStr !== null) {
    return `${formattedInt}${decimalSep}${decimalStr}`;
  }

  return formattedInt;
};
