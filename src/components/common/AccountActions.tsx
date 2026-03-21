import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

type Props = {
  primary?: "deposit" | "withdraw" | "transfer";
  className?: string;
  itemClassName?: string;
};

const ACTIONS = [
  { label: "Deposit", value: "deposit" },
  { label: "Withdraw", value: "withdraw" },
  { label: "Transfer", value: "transfer" },
] as const;

const AccountActions = ({ primary, className, itemClassName }: Props) => {
  return (
    <div
      className={cn("flex items-center justify-between gap-1 py-2", className)}
    >
      {ACTIONS.map((action) => (
        <Button
          key={action.value}
          variant={action.value === primary ? "default" : "secondary"}
          size="sm"
          className={cn(
            "flex-1 text-background text-xs font-medium h-7",
            { "text-white": action.value !== primary },
            itemClassName,
          )}
          onClick={() =>
            useAccountTransactStore.getState().openAccountTransact(action.value)
          }
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default AccountActions;
