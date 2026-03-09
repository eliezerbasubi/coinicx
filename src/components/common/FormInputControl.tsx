import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputNumberControl } from "@/components/ui/input-number";
import { cn } from "@/utils/cn";

type Props = {
  max: string | number;
  onValueChange: (value: string) => void;
} & React.ComponentProps<typeof InputNumberControl>;

const PERCENTAGES = [10, 25, 50, 75, 100];

const FormInputControl = ({ value, max, onValueChange, ...props }: Props) => {
  const [currentPercentage, setCurrentPercentage] = useState(100);

  const maxValue = Number(max);

  return (
    <div className="w-full space-y-2">
      <InputNumberControl
        value={value}
        {...props}
        onChange={(e) => {
          onValueChange(e.target.value);
          setCurrentPercentage(-1);
        }}
      />
      <div className="flex items-center justify-end gap-x-1">
        {PERCENTAGES.map((percentage) => (
          <Button
            key={percentage}
            size="sm"
            variant="secondary"
            className={cn("h-6 w-fit text-xs font-semibold", {
              "bg-primary/10 text-primary":
                value && currentPercentage === percentage,
            })}
            label={percentage === 100 ? "Max" : `${percentage}%`}
            disabled={!maxValue}
            onClick={() => {
              setCurrentPercentage(percentage);
              onValueChange?.((maxValue * (percentage / 100)).toString());
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FormInputControl;
