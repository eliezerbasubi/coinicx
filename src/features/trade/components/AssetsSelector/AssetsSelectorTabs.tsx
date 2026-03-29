import React from "react";

import { cn } from "@/lib/utils/cn";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "favourites", label: "Favourites" },
  { value: "perps", label: "Perps" },
  { value: "spot", label: "Spot" },
  { value: "xyz", label: "Tradfi" },
  { value: "flx", label: "Felix Exchange" },
  { value: "vntl", label: "Ventuals" },
  { value: "hyna", label: "HyENA" },
] as const;

type Props = {
  className?: string;
  value?: string;
  onValueChange?: (tab: string) => void;
};

const AssetsSelectorTabs = ({ value, className, onValueChange }: Props) => {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList
        variant="line"
        className="w-full flex md:block bg-primary-dark px-3"
      >
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="w-fit text-xs font-medium cursor-pointer capitalize py-0.5 first:pl-0 text-neutral-gray-400"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default AssetsSelectorTabs;
