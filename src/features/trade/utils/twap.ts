export const FREQUENCY = 30; // seconds
export const MIN_MINUTES = 5; // minutes
export const MAX_MINUTES = 1440; // minutes

export const convertTimeToMinutes = (time: {
  hours: string;
  minutes: string;
}) => {
  const { hours, minutes } = time;

  const totalMinutes = Number(hours || 0) * 60 + Number(minutes || 0);

  if (hours === "23" && minutes === "59") {
    return totalMinutes + 1;
  }

  return totalMinutes;
};

/**
 * Calculates the number of orders to be placed for a TWAP order.
 * Convert the total tim from minutes to seconds and add 1 to place order at the start of the TWAP order
 * @param minutes - The total time in minutes for the TWAP order.
 * @returns The number of orders to be placed for a TWAP order.
 */
export const calculateNumberOfOrders = (minutes: number) => {
  if (minutes === 0) return 0;

  return (60 * minutes) / FREQUENCY + 1;
};

export const calculateSubOrderSize = (params: {
  size: string | number;
  minutes: number;
}) => {
  const { size, minutes } = params;

  const parsedSize = parseFloat(size.toString() || "0");

  if (parsedSize === 0 || minutes === 0) return 0;

  const numOfOrders = calculateNumberOfOrders(minutes);

  return parsedSize / numOfOrders;
};

export const isValidTwapMinutes = (minutes: number) => {
  return minutes >= MIN_MINUTES && minutes <= MAX_MINUTES;
};

/**
 * Formats the total duration in minutes into a human-readable string
 * with periods written in full (e.g. "30 minutes", "2 hours", "1 day").
 *
 * @param totalMinutes - The total duration in minutes.
 * @returns A human-readable duration string.
 */
export const formatTotalRuntime = (totalMinutes: number): string => {
  const weeks = Math.floor(totalMinutes / 10080);
  const days = Math.floor((totalMinutes % 10080) / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (weeks > 0) {
    const label = weeks === 1 ? "week" : "weeks";
    if (days > 0)
      return `${weeks} ${label} ${days} ${days === 1 ? "day" : "days"}`;
    return `${weeks} ${label}`;
  }

  if (days > 0) {
    const label = days === 1 ? "day" : "days";
    if (hours > 0)
      return `${days} ${label} ${hours} ${hours === 1 ? "hour" : "hours"}`;
    return `${days} ${label}`;
  }

  if (hours > 0) {
    const label = hours === 1 ? "hour" : "hours";
    if (minutes > 0)
      return `${hours} ${label} ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    return `${hours} ${label}`;
  }

  return `${minutes} minutes`;
};

/**
 * Formats the elapsed time as hh:mm:ss from seconds.
 *
 * @param elapsedSeconds - The elapsed time in seconds.
 * @returns A string in hh:mm:ss format.
 */
const formatElapsedTime = (elapsedSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(elapsedSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;

  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

/**
 * Formats the running time of a TWAP.
 *
 * When `includeElapsed` is true, returns the elapsed time (computed from the
 * start timestamp) followed by the total duration separated by a slash
 * (e.g. "00:15:30 / 30 minutes").
 *
 * When `includeElapsed` is false, returns only the total duration written
 * in full (e.g. "30 minutes", "1 day", "2 weeks").
 *
 * @param params.totalMinutes   - The total planned duration in minutes.
 * @param params.startTimestamp - The epoch timestamp (ms) when the TWAP started.
 * @param params.includeElapsed - Whether to prepend the elapsed time.
 */
export const formatTwapRuntime = (params: {
  totalMinutes: number;
  startTimestamp: number;
  includeElapsed: boolean;
}): string => {
  const { totalMinutes, startTimestamp, includeElapsed } = params;
  const total = formatTotalRuntime(totalMinutes);

  if (!includeElapsed) return total;

  const elapsedSeconds = (Date.now() - startTimestamp) / 1000;
  const elapsed = formatElapsedTime(elapsedSeconds);

  return `${elapsed} / ${total}`;
};
