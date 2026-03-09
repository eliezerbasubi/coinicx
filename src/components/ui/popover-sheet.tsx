import React from "react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  open?: boolean;
  modal?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  triggerRef?: React.Ref<HTMLElement>;
  onOpenChange?: (open: boolean) => void;
} & React.ComponentProps<typeof PopoverContent>;

const PopoverSheet = ({
  open,
  modal,
  children,
  trigger,
  triggerRef,
  onOpenChange,
  ...props
}: Props) => {
  return (
    <Popover modal={modal} open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}

      {triggerRef && (
        <PopoverAnchor asChild>
          <span ref={triggerRef} />
        </PopoverAnchor>
      )}

      <PopoverContent {...props}>{children}</PopoverContent>
    </Popover>
  );
};

export default PopoverSheet;
