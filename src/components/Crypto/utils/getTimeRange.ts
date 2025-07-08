import { GraphPeriod } from "@/types/market";

export const getTimeRange = (period: GraphPeriod) => {
  const now = Math.floor(Date.now() / 1000);
  let from: number;

  switch (period) {
    case "daily":
      from = now - 86400; // 24 * 60 * 60
      break;
    case "weekly":
      from = now - 7 * 86400;
      break;
    case "monthly":
      from = now - 30 * 86400; // Approximate month
      break;
    case "yearly":
      from = now - 365 * 86400; // Approximate year
      break;
    default:
      throw new Error(`Unsupported period: ${period}`);
  }

  return { from, to: now };
};
