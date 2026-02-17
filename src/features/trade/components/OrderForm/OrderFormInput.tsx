import React from "react";

import InputNumberFormatter from "@/components/common/InputNumberFormatter";
import { cn } from "@/utils/cn";

type Props = {
  label?: string;
  trailing?: React.ReactNode;
  wrapperClassName?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const OrderFormInput = ({
  label,
  trailing,
  wrapperClassName,
  ...props
}: Props) => {
  return (
    <label
      htmlFor={props.id}
      className={cn(
        "w-full h-11 flex items-center gap-x-1 border border-neutral-gray-200 focus-within:border-primary rounded-md px-3",
        wrapperClassName,
      )}
    >
      {label && (
        <p className="text-sm text-neutral-gray-400 font-medium whitespace-nowrap">
          {label}
        </p>
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

export default OrderFormInput;
