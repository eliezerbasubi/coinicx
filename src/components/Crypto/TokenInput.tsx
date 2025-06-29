"use client";

import React from "react";

type Props = {
  label: string;
  placeholder: string;
  name: string;
  trailing?: React.ReactNode;
  onChange?: (value: number) => void;
};

const TokenInput = ({
  label,
  placeholder,
  name,
  trailing,
  onChange,
}: Props) => {
  return (
    <div className="w-full border border-neutral-gray-200 rounded-xl text-white p-3">
      <p className="text-sm font-medium">{label}</p>

      <div className="relative w-full flex justify-between items-center mt-1">
        <input
          placeholder={placeholder}
          name={name}
          id={name}
          className="outline-none text-[18px] leading-7 md:text-2xl md:leading-8 text-white placeholder:text-neutral-gray-400 font-semibold"
          onChange={({ target: { valueAsNumber } }) =>
            onChange?.(valueAsNumber)
          }
        />

        {trailing}
      </div>
    </div>
  );
};

export default TokenInput;
