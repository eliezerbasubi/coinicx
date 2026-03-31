import { cn } from "@/lib/utils/cn";

export const SummaryLabel = ({
  label,
  className,
}: {
  label: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-xs text-neutral-gray-400 font-medium", className)}>
      {label}
    </div>
  );
};

export const SummaryValue = ({
  value,
  className,
}: {
  value: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-xs text-white font-medium", className)}>
      {value}
    </div>
  );
};

export const SummaryItem = ({
  label,
  value,
  className,
  valueClassName,
  labelClassName,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <SummaryLabel label={label} className={labelClassName} />
      <SummaryValue value={value} className={valueClassName} />
    </div>
  );
};

export const Summary = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "w-full space-y-1 bg-neutral-gray-600 p-2 rounded-lg",
        className,
      )}
    >
      {children}
    </div>
  );
};
