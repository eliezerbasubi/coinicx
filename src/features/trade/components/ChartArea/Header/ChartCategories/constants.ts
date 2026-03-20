import { ChartType } from "@/lib/types/trade";

export const CATEGORIES: Array<{ label: string; value: ChartType }> = [
  { label: "Standard", value: "standard" },
  // { label: "Trading View", value: "tradingView" },
  { label: "Depth", value: "depth" },
];
