import React from "react";

import { formatInputValue } from "@/utils/formatting/numbers";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { formatOptions?: Intl.NumberFormatOptions };

const InputNumberFormatter = ({ formatOptions, ...props }: Props) => {
  const formattedValue = formatInputValue(String(props.value), {
    maximumFractionDigits: 14,
    ...(formatOptions ?? {}),
  });

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      {...props}
      value={formattedValue === "0" ? "" : formattedValue}
      onInput={(e) => {
        const input = e.target as HTMLInputElement;
        // Remove all non-digit and non-dot characters
        let value = input.value.replace(/[^0-9.]/g, "");
        // Prevent more than one dot
        const parts = value.split(".");
        if (parts.length > 2) {
          value = parts[0] + "." + parts.slice(1).join("");
        }
        // Prevent dot at the start
        if (value.startsWith(".")) {
          value = value.replace(/^\./, "");
        }
        input.value = value;
      }}
    />
  );
};

export default InputNumberFormatter;
