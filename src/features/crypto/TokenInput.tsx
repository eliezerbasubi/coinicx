"use client";

import React from "react";

import { InputNumberFormatter } from "@/components/ui/input-number";

type Props = {
  label: string;
  trailing?: React.ReactNode;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const TokenInput = ({ label, name, trailing, ...props }: Props) => {
  return (
    <div className="w-full border border-neutral-gray-200 rounded-xl text-white p-4">
      <p className="text-sm font-medium">{label}</p>

      <div className="relative w-full flex justify-between items-center mt-1">
        <InputNumberFormatter
          name={name}
          id={name}
          className="w-fit outline-none text-[18px] leading-7 md:text-2xl md:leading-8 text-white placeholder:text-neutral-gray-400 font-semibold"
          {...props}
        />

        {trailing}
      </div>
    </div>
  );
};

export default TokenInput;
