import { useMemo } from "react";

import UnderlineTooltip from "@/components/common/UnderlineTooltip";
import { Button } from "@/components/ui/button";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { useShallowUserTradeStore } from "@/store/trade/user-trade";
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
          >
            Deposit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
          >
            Withdraw
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-white text-xs font-medium h-7"
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

  const { getSpotAssetsData } = useMetaAndAssetCtxs();

  const { tokensToUniverseIndex } = getSpotAssetsData();

  const spotValue = useMemo(() => {
    if (!tokensToUniverseIndex.size) return 0;

    return spotBalances.reduce((acc, balance) => {
      const amount = Number(balance.total);

      if (balance.token === 0) {
        return acc + amount;
      }

      const tokenMap = tokensToUniverseIndex.get(balance.token);
      if (tokenMap === undefined) return acc;

      // Prefer USDC-quoted pairs (token 0) for accurate USD conversion.
      const quoteTokenIndex = tokenMap.get(0);

      if (quoteTokenIndex === undefined) return acc;

      const ctx = spotAssetCtxs[quoteTokenIndex];
      const markPx = Number(ctx?.markPx || "0");

      return acc + amount * markPx;
    }, 0);
  }, [spotBalances, spotAssetCtxs, tokensToUniverseIndex]);

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
          <UnderlineTooltip
            contentClassName="max-w-fit"
            content={
              <p>
                Total Net Transfers + Total Realized Profit + Total Net Funding
                Fees
              </p>
            }
          >
            <p className="text-neutral-gray-400">Balance</p>
          </UnderlineTooltip>
          <p className="text-white font-medium">
            {formatNumber(accountValue - unrealizedPnl, {
              style: "currency",
            })}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <UnderlineTooltip
            contentClassName="max-w-fit"
            content={
              <p>Approximate account value if all positions were closed</p>
            }
          >
            <p className="text-neutral-gray-400">Unrealized PnL</p>
          </UnderlineTooltip>
          <p className="text-white font-medium">
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

  const crossMarginRatio = crossMaintenanceMarginUsed / accountValue;
  const crossAccountLeverage =
    Number(allDexsClearinghouseState?.marginSummary.totalNtlPos || "0") /
    accountValue;

  return (
    <div className="w-full mt-3">
      <p className="text-xs text-white font-semibold my-2">Margin</p>

      <div className="w-full mt-1 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <UnderlineTooltip
            content={
              <p>
                Maintenance Margin / Portfolio Value. Your cross positions will
                be liquidated if Margin Ratio reaches 100%.
              </p>
            }
          >
            <p className="text-neutral-gray-400">Cross Margin Ratio</p>
          </UnderlineTooltip>
          <p className="text-white font-medium">
            {formatNumber(crossMarginRatio * 100, {
              style: "percent",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <UnderlineTooltip
            contentClassName="max-w-fit"
            content={
              <p>
                Minimum portfolio value required to keep your cross positions
                open
              </p>
            }
          >
            <p className="text-neutral-gray-400">Maintenance Margin</p>
          </UnderlineTooltip>
          <p className="text-white font-medium">
            {formatNumber(crossMaintenanceMarginUsed, { style: "currency" })}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <UnderlineTooltip
            contentClassName="max-w-fit"
            content={
              <p>
                Cross Account Leverage = Total Cross Positions Value / Cross
                Account Value
              </p>
            }
          >
            <p className="text-neutral-gray-400">Cross Account Leverage</p>
          </UnderlineTooltip>
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
