import { useMemo } from "react";

import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { Button } from "@/components/ui/button";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { useAccountTransactStore } from "@/store/trade/account-transact";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

const UserAccountInfo = () => {
  return (
    <div className="w-full md:max-w-80 bg-primary-dark md:rounded-md pb-6 md:pb-0">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
        <p className="text-sm font-semibold">Account</p>
      </div>

      <div className="w-full px-4">
        <div className="flex items-center justify-between gap-1 py-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("deposit")
            }
          >
            Deposit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("withdraw")
            }
          >
            Withdraw
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
            onClick={() =>
              useAccountTransactStore.getState().openAccountTransact("transfer")
            }
          >
            Transfer
          </Button>
        </div>

        <div className="w-full">
          <p className="text-xs text-white font-semibold my-2">
            Account Equity
          </p>

          <SpotEquity />

          <PerpsEquity />
        </div>

        <AccountMargin />
      </div>
    </div>
  );
};

const SpotEquity = () => {
  const spotBalances = useShallowUserTradeStore((s) => s.spotBalances);
  const spotAssetCtxs = useShallowInstrumentStore((s) => s.spotAssetCtxs);

  const { tokensToSpotId } = useMetaAndAssetCtxs();

  const spotValue = useMemo(() => {
    if (!tokensToSpotId?.size) return 0;

    return spotBalances.reduce((acc, balance) => {
      const amount = Number(balance.total);

      if (balance.token === 0) {
        return acc + amount;
      }

      const tokenMap = tokensToSpotId.get(balance.token);
      if (tokenMap === undefined) return acc;

      // Prefer USDC-quoted pairs (token 0) for accurate USD conversion.
      const spotId = tokenMap.get(0);

      if (spotId === undefined) return acc;

      const ctx = spotAssetCtxs[spotId];
      const markPx = Number(ctx?.markPx || "0");

      return acc + amount * markPx;
    }, 0);
  }, [spotBalances, spotAssetCtxs, tokensToSpotId]);

  return (
    <div className="flex items-center justify-between text-xs">
      <p className="text-neutral-gray-400">Spot total value</p>
      <p className="text-white font-medium">
        {formatNumber(Number(spotValue || "0"), { style: "currency" })}
      </p>
    </div>
  );
};

const PerpsEquity = () => {
  const { marginSummary, assetPositions } = useShallowUserTradeStore((s) => ({
    assetPositions: s.allDexsClearinghouseState?.assetPositions,
    marginSummary: s.allDexsClearinghouseState?.marginSummary,
  }));

  const accountValue = Number(marginSummary?.accountValue || "0");

  const unrealizedPnl =
    assetPositions?.reduce((acc, pos) => {
      return acc + Number(pos.position.unrealizedPnl);
    }, 0) ?? 0;

  return (
    <div className="w-full mt-1 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <p className="text-neutral-gray-400">Perps total value</p>
        <p className="text-white font-medium">
          {formatNumber(accountValue, { style: "currency" })}
        </p>
      </div>
      <div className="w-full pl-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <AdaptiveTooltip
            variant="underline"
            className="max-w-fit"
            trigger={<p className="text-neutral-gray-400">Balance</p>}
          >
            <p>
              Total Net Transfers + Total Realized Profit + Total Net Funding
              Fees
            </p>
          </AdaptiveTooltip>
          <p className="text-white font-medium">
            {formatNumber(accountValue - unrealizedPnl, {
              style: "currency",
            })}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <AdaptiveTooltip
            variant="underline"
            className="max-w-fit"
            title="Unrealized PnL"
            trigger={<p className="text-neutral-gray-400">Unrealized PnL</p>}
          >
            <p>
              Total Net Transfers + Total Realized Profit + Total Net Funding
              Fees
            </p>
          </AdaptiveTooltip>
          <p
            className={cn("text-white font-medium", {
              "text-buy": unrealizedPnl > 0,
              "text-sell": unrealizedPnl < 0,
            })}
          >
            {formatNumber(unrealizedPnl, { style: "currency" })}
          </p>
        </div>
      </div>
    </div>
  );
};

const AccountMargin = () => {
  const allDexsClearinghouseState = useShallowUserTradeStore(
    (s) => s.allDexsClearinghouseState,
  );

  const accountValue = Number(
    allDexsClearinghouseState?.marginSummary.accountValue || "0",
  );
  const crossMaintenanceMarginUsed = Number(
    allDexsClearinghouseState?.crossMaintenanceMarginUsed || "0",
  );

  const crossMarginRatio = accountValue
    ? crossMaintenanceMarginUsed / accountValue
    : 0;
  const crossAccountLeverage = accountValue
    ? Number(allDexsClearinghouseState?.marginSummary.totalNtlPos || "0") /
      accountValue
    : 0;

  return (
    <div className="w-full mt-3">
      <p className="text-xs text-white font-semibold my-2">Margin</p>

      <div className="w-full mt-1 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <AdaptiveTooltip
            variant="underline"
            className="max-w-fit"
            title="Cross Margin Ratio"
            trigger={
              <p className="text-neutral-gray-400">Cross Margin Ratio</p>
            }
          >
            <p>
              Maintenance Margin / Portfolio Value. Your cross positions will be
              liquidated if Margin Ratio reaches 100%.
            </p>
          </AdaptiveTooltip>
          <p
            className={cn("font-medium text-buy", {
              "text-sell": crossMarginRatio < 0,
            })}
          >
            {formatNumber(crossMarginRatio, {
              style: "percent",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <AdaptiveTooltip
            variant="underline"
            className="max-w-fit"
            title="Maintenance Margin"
            trigger={
              <p className="text-neutral-gray-400">Maintenance Margin</p>
            }
          >
            <p>
              Minimum portfolio value required to keep your cross positions open
            </p>
          </AdaptiveTooltip>
          <p className="text-white font-medium">
            {formatNumber(crossMaintenanceMarginUsed, { style: "currency" })}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <AdaptiveTooltip
            variant="underline"
            className="max-w-fit"
            title="Cross Account Leverage"
            trigger={
              <p className="text-neutral-gray-400">Cross Account Leverage</p>
            }
          >
            <p>
              Cross Account Leverage = Total Cross Positions Value / Cross
              Account Value
            </p>
          </AdaptiveTooltip>
          <p className="text-white font-medium">
            {formatNumber(crossAccountLeverage, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            x
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserAccountInfo;
