"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import { useShallowSwapStore } from "../store";
import { MIN_HIGH_SLIPPAGE } from "../constants";

const SlippageModal = dynamic(() => import("./SlippageModal"), { ssr: false });

const SettingsTrigger = () => {
  const slippage = useShallowSwapStore((s) => s.slippage);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const isHighSlippage = slippage > MIN_HIGH_SLIPPAGE;

  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center gap-1 bg-neutral-gray-600 text-neutral-gray-400 p-2 rounded-full cursor-pointer transition-colors",
        { "bg-red-500/10 text-red-500": isHighSlippage },
      )}
      onClick={() => setOpen(true)}
    >
      <p className="text-xs font-semibold">{slippage}%</p>
      <Settings className="size-4 -mr-1" />

      <SlippageModal open={open} triggerRef={ref} onOpenChange={setOpen} />
    </button>
  );
};

export default SettingsTrigger;
