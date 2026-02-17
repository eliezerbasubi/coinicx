import { Period } from "klinecharts";

export const getKlinePeriod = (intervalValue: string): Period => {
  if (intervalValue.endsWith("m")) {
    return { type: "minute", span: Number(intervalValue.charAt(0)) };
  }
  if (intervalValue.endsWith("h")) {
    return { type: "hour", span: Number(intervalValue.charAt(0)) };
  }
  if (intervalValue.endsWith("d")) {
    return { type: "day", span: Number(intervalValue.charAt(0)) };
  }
  if (intervalValue.endsWith("w")) {
    return { type: "week", span: Number(intervalValue.charAt(0)) };
  }
  if (intervalValue.endsWith("M")) {
    return { type: "month", span: Number(intervalValue.charAt(0)) };
  }
  return { type: "minute", span: 1 };
};
