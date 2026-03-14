import React, { useMemo } from "react";

import { cn } from "@/utils/cn";
import {
  buildAllowedCharsRegex,
  COMMON_DECIMAL_SEPARATORS,
  formatWithGrouping,
  getLocaleDecimalSeparator,
  getLocaleGroupSeparator,
  normalizeDecimalSeparator,
  stripGroupSeparators,
  toParseableNumber,
} from "@/utils/formatting/normalize-input-number";

export {
  toParseableNumber,
  toDisplayNumber,
} from "@/utils/formatting/normalize-input-number";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  locale?: string;
  useGrouping?: boolean;
};

const InputNumber = ({ locale, useGrouping, ...props }: Props) => {
  const { localeSeparator, groupSeparator, allowedCharsRegex } = useMemo(
    () => ({
      localeSeparator: getLocaleDecimalSeparator(locale),
      groupSeparator: getLocaleGroupSeparator(locale),
      allowedCharsRegex: buildAllowedCharsRegex(COMMON_DECIMAL_SEPARATORS),
    }),
    [locale],
  );

  const displayValue = useMemo(() => {
    const raw = props.value?.toString() || "";
    if (!raw) return "";

    if (useGrouping) {
      return formatWithGrouping(raw, locale);
    }

    return normalizeDecimalSeparator(raw, localeSeparator);
  }, [props.value, useGrouping, locale, localeSeparator]);

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      {...props}
      value={displayValue}
      onChange={(e) => {
        let value = e.target.value;
        if (useGrouping && groupSeparator) {
          value = stripGroupSeparators(value, groupSeparator);
        }
        e.target.value = toParseableNumber(value);
        props.onChange?.(e);
      }}
      onInput={(e) => {
        const input = e.target as HTMLInputElement;
        let value = input.value;

        // Strip group separators when formatting is enabled (they're display-only)
        if (useGrouping && groupSeparator) {
          value = stripGroupSeparators(value, groupSeparator);
        }

        // Remove all characters except digits and recognized decimal separators
        value = value.replace(allowedCharsRegex, "");

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

type InputNumberFormatterProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const InputNumberFormatter = (props: InputNumberFormatterProps) => {
  return <InputNumber useGrouping {...props} />;
};

type InputNumberControlProps = {
  label?: React.ReactNode;
  trailing?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  onValueChange?: (value: string) => void;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const InputNumberControl = ({
  label,
  trailing,
  wrapperClassName,
  labelClassName,
  onValueChange,
  ...props
}: InputNumberControlProps) => {
  return (
    <label
      htmlFor={props.id}
      className={cn(
        "w-full h-9 flex items-center gap-x-1 border border-neutral-gray-200 focus-within:border-primary rounded-md px-3",
        wrapperClassName,
      )}
    >
      {label && (
        <div
          className={cn(
            "text-sm text-neutral-gray-400 font-medium whitespace-nowrap",
            labelClassName,
          )}
        >
          {label}
        </div>
      )}

      <InputNumberFormatter
        {...props}
        className={cn(
          "w-full caret-primary text-white font-medium text-right outline-0",
          props.className,
        )}
        onChange={(e) => onValueChange?.(e.target.value) || props.onChange?.(e)}
      />
      {trailing}
    </label>
  );
};

export { InputNumberFormatter, InputNumber, InputNumberControl };
