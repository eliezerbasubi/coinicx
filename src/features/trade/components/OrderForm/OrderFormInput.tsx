import React from "react";

import InputNumberFormatter from "@/components/common/InputNumberFormatter";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";

type Props = {
  label?: React.ReactNode;
  trailing?: React.ReactNode;
  wrapperClassName?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const OrderFormInput = ({
  label,
  trailing,
  wrapperClassName,
  ...props
}: Props) => {
  return (
    <label
      htmlFor={props.id}
      className={cn(
        "w-full h-9 flex items-center gap-x-1 border border-neutral-gray-200 focus-within:border-primary rounded-md px-3",
        wrapperClassName,
      )}
    >
      {label && (
        <div className="text-sm text-neutral-gray-400 font-medium whitespace-nowrap">
          {label}
        </div>
      )}

      <InputNumberFormatter
        {...props}
        className={cn(
          "w-full caret-primary text-white font-medium text-right outline-0",
          props.className,
        )}
      />
      {trailing}
    </label>
  );
};

export const TrailingQuote = () => {
  const quote = useShallowInstrumentStore((s) => s.assetMeta?.quote);

  return (
    <div className="flex items-center gap-x-2">
      <span className="text-neutral-300 text-sm font-medium">{quote}</span>
    </div>
  );
};
