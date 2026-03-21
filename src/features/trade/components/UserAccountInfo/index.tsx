import { formatNumber } from "@/lib/utils/formatting/numbers";
import AccountActions from "@/components/common/AccountActions";
import { useAccountBalances } from "@/features/trade/hooks/useAccountBalances";

import AccountMarginItems from "./AccountMarginItems";
import PerpEquityItems from "./PerpEquityItems";

const UserAccountInfo = () => {
  return (
    <div className="w-full md:max-w-80 lg:max-w-65 xl:max-w-80 bg-primary-dark md:rounded-md pb-6 md:pb-0">
      <div className="w-full border-b border-neutral-gray-200 px-4 h-11 flex items-center justify-between">
        <p className="text-sm font-semibold">Account</p>
      </div>

      <div className="w-full px-4 flex flex-col-reverse gap-y-6 md:flex-col md:gap-y-0">
        <AccountActions className="flex-wrap" />

        <div className="w-full">
          <AccountEquity />

          <AccountMargin />
        </div>
      </div>
    </div>
  );
};

const AccountEquity = () => {
  const { spotEquity, perpsEquity } = useAccountBalances();

  return (
    <div className="w-full">
      <p className="text-xs text-white font-semibold my-2">Account Equity</p>

      <div className="flex items-center justify-between text-xs">
        <p className="text-neutral-gray-400">Spot total value</p>
        <p className="text-white font-medium">
          {formatNumber(Number(spotEquity || "0"), { style: "currency" })}
        </p>
      </div>

      <div className="w-full mt-1 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <p className="text-neutral-gray-400">Perps total value</p>
          <p className="text-white font-medium">
            {formatNumber(perpsEquity, { style: "currency" })}
          </p>
        </div>
        <div className="w-full pl-2 space-y-1">
          <PerpEquityItems />
        </div>
      </div>
    </div>
  );
};

const AccountMargin = () => {
  return (
    <div className="w-full mt-3">
      <p className="text-xs text-white font-semibold my-2">Margin</p>

      <div className="w-full mt-1 space-y-1">
        <AccountMarginItems />
      </div>
    </div>
  );
};

export default UserAccountInfo;
