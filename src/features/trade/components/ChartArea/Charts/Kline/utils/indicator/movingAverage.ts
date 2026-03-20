import { IndicatorCalcFn, KlineIndicatorCalcParam } from "../../types";

export const movingAverage: IndicatorCalcFn = (kLineDataList, indicator) => {
  const { calcParams, figures } = indicator;

  const results: Array<Record<string, number>> = kLineDataList.map(() => ({}));

  calcParams.forEach((param, index) => {
    const { period, source } = param as KlineIndicatorCalcParam;

    if (period > 0) {
      let sum = 0;
      for (let i = 0; i < kLineDataList.length; i++) {
        const value = kLineDataList[i][source];
        sum += value;
        if (i >= period) {
          sum -= kLineDataList[i - period][source];
        }
        if (i >= period - 1) {
          results[i][figures[index].key] = sum / period;
        }
      }
    }
  });

  return results;
};
