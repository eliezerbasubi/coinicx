import React from "react";

import { InputNumberControl } from "@/components/ui/input-number";
import { cn } from "@/utils/cn";

type Props = React.ComponentProps<typeof InputNumberControl>;

const OrderFormInput = (props: Props) => {
  return (
    <InputNumberControl
      {...props}
      labelClassName="text-xs md:text-sm"
      wrapperClassName={cn("h-8 md:h-9 px-2 md:px-3", props.wrapperClassName)}
      className={cn("text-xs md:text-sm", props.className)}
    />
  );
};

export default OrderFormInput;
