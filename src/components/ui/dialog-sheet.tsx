import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;

type Props = {
  open?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
};

const DialogSheet = ({
  open,
  className,
  children,
  trigger,
  title,
  description,
  onOpenChange,
  onPointerDownOutside,
  onOpenAutoFocus,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={className}
        onPointerDownOutside={onPointerDownOutside}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        <DialogHeader
          className={cn("p-4", { "sr-only": !title && !description })}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogSheet;
