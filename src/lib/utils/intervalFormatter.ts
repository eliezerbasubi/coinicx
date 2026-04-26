/** Parses an interval string into its components */
export function parseInterval(interval: string) {
  const match = interval.match(/^(\d+)(m|h|d|w|M|y)$/);
  if (!match) return null;

  const span = parseInt(match[1]);
  return { span, unit: match[2] };
}

/** Returns the label for a given interval unit */
export function getUnitLabel(unit: string) {
  switch (unit) {
    case "m":
      return "minute";
    case "h":
      return "hour";
    case "d":
      return "day";
    case "w":
      return "week";
    case "M":
      return "month";
    case "y":
      return "year";
    default:
      return "";
  }
}

/** Returns the type of interval for a given period */
export function parseIntervalType(period: string) {
  const interval = parseInterval(period);
  if (!interval) return "daily";

  switch (interval.unit) {
    case "m":
    case "h":
    case "d":
      return "daily";
    case "w":
      return "weekly";
    case "M":
      return "monthly";
    case "y":
      return "yearly";
    default:
      return "daily";
  }
}

/** Returns the time range for a given interval */
export const getChartTimeRange = (interval: string) => {
  const endTime = Date.now();
  let startTime: number;

  switch (interval) {
    case "1m":
      startTime = endTime - 5 * 60 * 60 * 1000; // ~5 hours
      break;
    case "3m":
      startTime = endTime - 16 * 60 * 60 * 1000; // ~16 hours
      break;
    case "5m":
      startTime = endTime - 24 * 60 * 60 * 1000; // ~1 day
      break;
    case "15m":
      startTime = endTime - 3 * 24 * 60 * 60 * 1000; // ~3 days
      break;
    case "30m":
      startTime = endTime - 7 * 24 * 60 * 60 * 1000; // ~7 days
      break;
    case "1h":
      startTime = endTime - 14 * 24 * 60 * 60 * 1000; // ~2 weeks
      break;
    case "2h":
      startTime = endTime - 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
    case "4h":
      startTime = endTime - 60 * 24 * 60 * 60 * 1000; // ~2 months
      break;
    case "8h":
      startTime = endTime - 120 * 24 * 60 * 60 * 1000; // ~4 months
      break;
    case "12h":
      startTime = endTime - 150 * 24 * 60 * 60 * 1000; // ~5 months
      break;
    case "1d":
      startTime = endTime - 365 * 24 * 60 * 60 * 1000; // ~1 year
      break;
    case "3d":
    case "1w":
    case "1M":
      startTime = endTime - 3 * 365 * 24 * 60 * 60 * 1000; // ~3 years
      break;
    default:
      throw new Error(`Unsupported interval: ${interval}`);
  }

  return { startTime, endTime };
};

export const tickMarkFormatter = (time: number, interval: string) => {
  const intervalType = parseIntervalType(interval);

  let formatterOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "numeric",
    hour12: true,
  };

  if (intervalType === "weekly" || intervalType === "monthly") {
    formatterOptions = {
      month: "short",
      day: "numeric",
    };
  } else if (intervalType === "yearly") {
    formatterOptions = {
      month: "short",
    };
  }

  const formatter = new Intl.DateTimeFormat("en-US", formatterOptions);

  return formatter.format(new Date(time));
};
