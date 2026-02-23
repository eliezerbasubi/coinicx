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
