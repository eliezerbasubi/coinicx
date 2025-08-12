import { Chart } from "klinecharts";

/**
 * Collects the most recent defined indicator values from a KlineCharts instance.
 *
 * This function iterates through all registered indicators in the chart instance,
 * finds the most recent (last defined) result for each indicator,
 * and returns them in the format:
 *
 * {
 *   [indicatorName]: {
 *     [indicatorKey]: number
 *   }
 * }
 *
 * Example output:
 * {
 *   MA: { ma1: 10546.43, ma2: 10488.12 },
 *   EMA: { ema1: 10540.21 }
 * }
 *
 * - Skips undefined/null result entries.
 * - Handles sparse arrays where the indicator hasn't produced values for some bars.
 * - Works for both built-in and custom indicators.
 *
 */
function collectLatestIndicatorValuesSafe(chart: Chart) {
  const resultObj: Record<string, unknown> = {};

  const indicators = chart.getIndicators();
  indicators.forEach((indicator) => {
    if (!indicator?.result || !Array.isArray(indicator.result)) return;

    // Find last defined value in result array
    let lastDefined: Record<string, unknown> | null = null;
    for (let i = indicator.result.length - 1; i >= 0; i--) {
      if (indicator.result[i] !== undefined && indicator.result[i] !== null) {
        lastDefined = indicator.result[i] as Record<
          string,
          Record<string, number>
        >;
        break;
      }
    }

    if (lastDefined && typeof lastDefined === "object") {
      // Build object of { [indicatorKey]: value }
      const innerObj: Record<string, unknown> = {};
      for (const key in lastDefined) {
        if (lastDefined[key] !== undefined && lastDefined[key] !== null) {
          innerObj[key] = lastDefined[key];
        }
      }

      resultObj[indicator.name] = innerObj;
    }
  });

  return resultObj;
}

/**
 * Waits until indicator results are available in a KlineCharts instance, then calls a callback.
 *
 * This function is designed to handle the timing gap between "onDataReady" and
 * when KlineCharts finishes calculating indicator values. It polls the chart
 * for valid indicator data until:
 *
 * - At least one indicator has a non-empty result, OR
 * - The maximum number of tries is reached.
 *
 * Useful for grabbing indicator values right after initial chart load.
 *
 */
export const waitForIndicatorResults = (
  chart: Chart,
  callback: (data: unknown) => void,
  maxTries = 10,
) => {
  let tries = 0;

  function check() {
    const values = collectLatestIndicatorValuesSafe(chart);
    if (Object.keys(values).length > 0 || tries >= maxTries) {
      callback(values);
    } else {
      tries++;
      requestAnimationFrame(check);
    }
  }

  check();
};
