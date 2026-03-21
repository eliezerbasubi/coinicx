import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";

import UserAccountInfoTile from "./UserAccountInfoTile";

type Props = {
  className?: string;
};

const AccountMarginItems = ({ className }: Props) => {
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
    <>
      <UserAccountInfoTile
        label="Cross Margin Ratio"
        tooltipContent="Maintenance Margin / Portfolio Value. Your cross positions will be liquidated if Margin Ratio reaches 100%."
        value={formatNumber(crossMarginRatio, {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        variant={crossMarginRatio < 0 ? "negative" : "positive"}
        className={className}
      />

      <UserAccountInfoTile
        label="Maintenance Margin"
        tooltipContent="Minimum portfolio value required to keep your cross positions open."
        value={formatNumber(crossMaintenanceMarginUsed, {
          style: "currency",
        })}
        className={className}
      />

      <UserAccountInfoTile
        label="Cross Account Leverage"
        tooltipContent="Cross Account Leverage = Total Cross Positions Value / Cross Account Value"
        value={
          formatNumber(crossAccountLeverage, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) + "x"
        }
        className={className}
      />
    </>
  );
};

export default AccountMarginItems;
