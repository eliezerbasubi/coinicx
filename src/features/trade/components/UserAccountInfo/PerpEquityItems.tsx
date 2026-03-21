import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";

import UserAccountInfoTile from "./UserAccountInfoTile";

type Props = {
  className?: string;
};

const PerpEquityItems = ({ className }: Props) => {
  const { accountValue, assetPositions } = useShallowUserTradeStore((s) => ({
    assetPositions: s.allDexsClearinghouseState?.assetPositions,
    accountValue: Number(
      s.allDexsClearinghouseState?.marginSummary?.accountValue || "0",
    ),
  }));

  const unrealizedPnl =
    assetPositions?.reduce((acc, pos) => {
      return acc + Number(pos.position.unrealizedPnl);
    }, 0) ?? 0;

  return (
    <>
      <UserAccountInfoTile
        label="Balance"
        tooltipContent="Total Net Transfers + Total Realized Profit + Total Net Funding Fees"
        value={formatNumber(accountValue - unrealizedPnl, {
          style: "currency",
        })}
        className={className}
      />

      <UserAccountInfoTile
        label="Unrealized PNL"
        tooltipContent="The unrealized profit and loss on your open position based on the current market price. It is not realized until you close the position."
        value={formatNumber(unrealizedPnl, {
          style: "currency",
        })}
        variant={
          unrealizedPnl > 0
            ? "positive"
            : unrealizedPnl < 0
              ? "negative"
              : "neutral"
        }
        className={className}
      />
    </>
  );
};

export default PerpEquityItems;
