/**
 * Formats a date/timestamp to DD/MM/YYYY hh:mm:ss format.
 */
export const formatDateTime = (value: number | string | Date): string => {
  const date = new Date(value);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const formatDate = (
  value: number | string | Date,
  options?: Intl.DateTimeFormatOptions,
) => {
  const date = new Date(value);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "numeric",
    hour12: true,
  };

  const formatterOptions = options ?? defaultOptions;

  const formatter = new Intl.DateTimeFormat("en-US", formatterOptions);

  return formatter.format(date);
};
