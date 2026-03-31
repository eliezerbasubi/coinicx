import { cn } from "@/lib/utils/cn";

const CardItem = ({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex-1 last:flex last:flex-col last:items-end space-y-0.5 text-white",
        className,
      )}
    >
      <div className="text-[11px] md:text-sm text-neutral-gray-400">
        {label}
      </div>
      <div className="text-xs">{value}</div>
    </div>
  );
};

export default CardItem;
