import { OrderType } from "@/types/trade";

export function isLimitOrder(type: OrderType) {
  return type === "limit" || type === "stopLimit";
}
export function isScaleOrder(type: OrderType) {
  return type === "scale" || isLimitOrder(type);
}
export function isStopOrder(type: OrderType) {
  return type === "stopLimit" || type === "stopMarket";
}
export function isLimitOrMarketOrder(type: OrderType) {
  return type === "limit" || type === "market";
}
export function isLimitOrScaleOrder(type: OrderType) {
  return type === "limit" || type === "scale";
}
export function isMarketOrder(type: OrderType) {
  return type === "market" || type === "stopMarket";
}
export function isExecutionOrder(type: OrderType) {
  return isLimitOrder(type) || isMarketOrder(type) || isStopOrder(type);
}
export function isScaleOrTwapOrder(type: OrderType) {
  return type === "scale" || type === "twap";
}
export function getOrderTif(type: OrderType) {
  return type === "market" ? "FrontendMarket" : "Gtc";
}
export function isTakeProfit(type: string) {
  return type === "Take Profit Limit" || type === "Take Profit Market";
}
export function isStopLoss(type: string) {
  return type === "Stop Limit" || type === "Stop Market";
}

export const orderTypeLabels: Record<string, string> = {
  "Take Profit Limit": "Limit (TP)",
  "Take Profit Market": "Market (TP)",
  "Stop Limit": "Limit (SL)",
  "Stop Market": "Market (SL)",
};
