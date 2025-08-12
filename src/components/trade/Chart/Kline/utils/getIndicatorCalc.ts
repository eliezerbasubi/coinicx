import { IndicatorCalcFn } from "../types";
import { movingAverage } from "./indicator";

export const getIndicatorCalc: IndicatorCalcFn = (...args) => {
  const name = args[1].name.toUpperCase();

  switch (name) {
    case "MA":
      return movingAverage(...args);

    default:
      return [];
  }
};
