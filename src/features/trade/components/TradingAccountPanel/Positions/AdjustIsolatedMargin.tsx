import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { Position } from "@/lib/types/trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import FormInputControl from "@/components/common/FormInputControl";
import TradingButton from "@/components/common/TradingButton";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdjustIsolatedMargin } from "@/features/trade/hooks/useAdjustIsolatedMargin";
import { roundToDecimals } from "@/features/trade/utils";

type Props = {
  position: Position;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const AdjustIsolatedMargin = ({ position, open, onOpenChange }: Props) => {
  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adjust Margin"
      description="Add margin to keep your position safer and lower the risk of liquidation or reduce extra margin to use for other positions."
      className="gap-1"
      headerClassName="gap-3"
    >
      <AdjustIsolatedMarginContent
        position={position}
        onSuccess={() => onOpenChange?.(false)}
      />
    </AdaptiveDialog>
  );
};

const AdjustIsolatedMarginContent = ({
  position,
  onSuccess,
}: {
  position: Position;
  onSuccess?: () => void;
}) => {
  const withdrawable = useShallowUserTradeStore(
    (s) => s.allDexsClearinghouseState?.withdrawable || "0",
  );

  const { state, onAmountChange, onTabChange, adjustIsolatedMargin } =
    useAdjustIsolatedMargin({ onSuccess });

  // @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margining
  const availableMarginToReduce = Math.max(
    0,
    Number(position.marginUsed) -
      Math.max(
        Number(position.positionValue) * 0.1, // Cap at 10% of position value
        Number(position.positionValue) / Number(position.leverage.value),
      ),
  );

  const availableMargin =
    state.currentTab === "addMargin"
      ? Number(withdrawable)
      : availableMarginToReduce;

  // Preserve precision for small amounts (less than 1)
  const roundingMode = availableMargin < 1 ? "ceil" : "floor";

  const hasInsufficientMargin =
    Number(state.amount) > roundToDecimals(availableMargin, 2, roundingMode);

  const label = hasInsufficientMargin
    ? "Insufficient Margin"
    : state.currentTab === "addMargin"
      ? "Add Margin"
      : "Reduce Margin";

  return (
    <Tabs
      value={state.currentTab}
      className="h-full gap-0"
      onValueChange={onTabChange}
    >
      <TabsList
        variant="line"
        className="w-full shrink-0 space-x-0 md:space-x-2 justify-start"
      >
        <TabsTrigger
          value="addMargin"
          className="w-fit flex-0 text-xs font-medium"
        >
          Add Margin
        </TabsTrigger>
        <TabsTrigger
          value="reduceMargin"
          className="w-fit flex-0 text-xs font-medium"
        >
          Reduce Margin
        </TabsTrigger>
      </TabsList>
      <div className="w-full">
        <div className="w-full space-y-1.5 my-3">
          <FormInputControl
            label="Amount"
            trailing={<p className="font-medium text-sm">{position.quote}</p>}
            className="text-sm"
            value={state.amount}
            max={availableMargin}
            onValueChange={onAmountChange}
            onPercentValueChange={(value) =>
              roundToDecimals(value, 2, roundingMode)
            }
          />
        </div>

        <div className="w-full space-y-1 bg-neutral-gray-600 p-2 rounded-lg mb-2">
          <div className="w-full flex items-center justify-between">
            <p className="text-xs text-neutral-gray-400 font-medium">
              Current Margin
            </p>
            <p className="text-xs text-white font-medium">
              {formatNumber(Number(position.marginUsed), { style: "currency" })}
            </p>
          </div>

          <div className="w-full flex items-center justify-between">
            <p className="flex-1 text-xs text-neutral-gray-400 font-medium">
              Margin available to{" "}
              {state.currentTab === "addMargin" ? "add" : "reduce"}
            </p>
            <p className="text-xs text-white font-medium">
              {formatNumber(availableMargin, {
                style: "currency",
                roundingMode,
              })}
            </p>
          </div>

          <Button
            variant="ghost"
            className="size-fit p-0 text-xs text-primary"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("deposit")
            }
          >
            Deposit for more margin
          </Button>
        </div>

        <TradingButton
          label={label}
          disabled={
            state.processing ||
            Number(state.amount) <= 0 ||
            hasInsufficientMargin
          }
          loading={state.processing}
          onClick={() =>
            adjustIsolatedMargin({
              assetId: position.assetId,
              isLong: position.isLong,
            })
          }
        />
      </div>
    </Tabs>
  );
};

export default AdjustIsolatedMargin;
