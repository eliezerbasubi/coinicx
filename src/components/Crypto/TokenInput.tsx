"use client";

import React from "react";

import { formatNumber } from "@/utils/formatting/numbers";

type Props = {
  label: string;
  trailing?: React.ReactNode;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const TokenInput = ({ label, name, trailing, ...props }: Props) => {
  const formattedValue = formatNumber(Number(props.value), {
    maximumFractionDigits: 14,
  });

  return (
    <div className="w-full border border-neutral-gray-200 rounded-xl text-white p-4">
      <p className="text-sm font-medium">{label}</p>

      <div className="relative w-full flex justify-between items-center mt-1">
        <input
          name={name}
          id={name}
          className="w-fit outline-none text-[18px] leading-7 md:text-2xl md:leading-8 text-white placeholder:text-neutral-gray-400 font-semibold"
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

        {trailing}
      </div>
    </div>
  );
};

export default TokenInput;
