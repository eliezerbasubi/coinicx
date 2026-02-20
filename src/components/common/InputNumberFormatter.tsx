import React from "react";

import InputNumber from "@/components/ui/input-number";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const InputNumberFormatter = (props: Props) => {
  return <InputNumber useGrouping {...props} />;
};

export default InputNumberFormatter;
