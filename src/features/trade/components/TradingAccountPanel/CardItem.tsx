import { cn } from "@/utils/cn";

const CardItem = ({
  label,
  value,
  className,
}: {
  label: string;
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
      <p className="text-[11px] md:text-sm text-neutral-gray-400">{label}</p>
      <div className="text-xs">{value}</div>
    </div>
  );
};

export default CardItem;
