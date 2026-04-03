import { cn } from "@/lib/utils/cn";

export const SummaryLabel = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("text-xs text-neutral-gray-400 font-medium", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SummaryValue = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("text-xs text-white font-medium", className)} {...props}>
      {children}
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
      <SummaryLabel className={labelClassName}>{label}</SummaryLabel>
      <SummaryValue className={valueClassName}>{value}</SummaryValue>
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
