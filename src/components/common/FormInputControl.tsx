import React, { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";

type Props = {
  max: string | number;
  percentClassName?: string;
  onValueChange?: (value: string) => void;

  /**
   * Function to parse the value when a percentage is selected.
   * @note This is useful for cases where you need to convert the percentage value to a specific format.
   * @note Don't pass the function for updating the value here, pass it to the onValueChange prop.
   * @param value - The value with the percentage applied.
   * @returns The parsed value.
   */
  onPercentValueChange?: (value: number) => number;
} & React.ComponentProps<typeof InputNumberControl>;

const PERCENTAGES = [10, 25, 50, 75, 100];

const FormInputControl = ({
  value,
  max,
  percentClassName,
  onValueChange,
  onPercentValueChange,
  ...props
}: Props) => {
  const [currentPercentage, setCurrentPercentage] = useState(100);

  const maxValue = Number(max);

  return (
    <div className="w-full space-y-2">
      <InputNumberControl
        value={value}
        {...props}
        onChange={(e) => {
          onValueChange?.(e.target.value);
          setCurrentPercentage(-1);
        }}
      />
      <div className="flex items-center justify-end gap-x-1">
        {PERCENTAGES.map((percentage) => (
          <Button
            key={percentage}
            size="sm"
            variant="secondary"
            className={cn(
              "h-6 w-fit text-xs font-semibold bg-neutral-gray-600 hover:bg-primary/10 hover:text-primary",
              percentClassName,
              {
                "bg-primary/10 text-primary":
                  value && currentPercentage === percentage,
              },
            )}
            label={percentage === 100 ? "Max" : `${percentage}%`}
            disabled={!maxValue}
            onClick={() => {
              const value = maxValue * (percentage / 100);
              const percentValue = onPercentValueChange?.(value) || value;

              setCurrentPercentage(percentage);

              onValueChange?.(percentValue.toString());
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FormInputControl;
