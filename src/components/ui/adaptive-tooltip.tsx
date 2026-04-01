import React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";
import { useIsDesktop } from "@/hooks/useIsMobile";

import { Button } from "./button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type Props = {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  trigger: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  hideArrow?: boolean;
  variant?: "default" | "underline";
  side?: React.ComponentProps<typeof TooltipContent>["side"];
  delayDuration?: number;
  onOpenChange?: (open: boolean) => void;
};

const adaptiveTooltipVariants = cva("bg-neutral-gray-200", {
  variants: {
    variant: {
      default:
        "w-32 bg-primary-dark rounded-md border border-neutral-gray-200 shadow-md p-0",
      underline: "max-w-64 text-neutral-gray-500 font-medium",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const AdaptiveTooltip = ({
  hideArrow,
  title,
  description,
  side,
  delayDuration,
  variant = "default",
  ...props
}: Props & VariantProps<typeof adaptiveTooltipVariants>) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Tooltip
        delayDuration={delayDuration}
        open={props.open}
        onOpenChange={props.onOpenChange}
      >
        <TooltipTrigger
          asChild
          className={cn({
            "underline decoration-dashed cursor-help": variant === "underline",
          })}
        >
          {props.trigger}
        </TooltipTrigger>
        <TooltipContent
          hideArrow={hideArrow}
          side={side}
          className={cn(adaptiveTooltipVariants({ variant }), props.className)}
        >
          {props.children}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerTrigger
        asChild
        className={cn({
          "underline decoration-dashed cursor-help": variant === "underline",
        })}
      >
        {props.trigger}
      </DrawerTrigger>
      <DrawerContent
        className={cn({ "text-sm": variant === "underline" }, props.className)}
      >
        <DrawerHeader className={cn({ "sr-only": !title && !description })}>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className={cn({ hidden: !description })}>
            {description}
          </DrawerDescription>
        </DrawerHeader>

        {props.children}

        {variant === "underline" && (
          <DrawerClose asChild>
            <Button className="w-full mt-3">Got it</Button>
          </DrawerClose>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default AdaptiveTooltip;
