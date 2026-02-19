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
export function getOrderTif(type: OrderType) {
  return type === "market" ? "FrontendMarket" : "Gtc";
}
