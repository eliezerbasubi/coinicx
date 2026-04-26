import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import { useShallowUserPredictionStore } from "@/features/predict/lib/store/user-prediction";
import { MarketEventMetaSide } from "@/features/predict/lib/types";
import { convertBalanceCoinToSpotName } from "@/features/predict/lib/utils/outcomes";

import OpenOrdersTag from "./OpenOrdersTag";
import OpenPositionTag from "./OpenPositionTag";

type Props = {
  outcomeIndex?: number;
  outcomeId: number;
  sides: MarketEventMetaSide[];
  className?: string;
};

const OpenTradesTags = ({
  outcomeId,
  outcomeIndex,
  sides,
  className,
}: Props) => {
  const { balances, openOrdersCount } = useShallowUserPredictionStore((s) => {
    return {
      balances: s.predictionBalances.get(outcomeId),
      openOrdersCount: s.openOrders.get(outcomeId)?.length ?? 0,
    };
  });

  const positions = useMemo(() => {
    if (!balances) return [];

    const currentOutcomePositions = [];

    for (const [sideIndex, side] of sides.entries()) {
      const balance = balances.find(
        (b) => convertBalanceCoinToSpotName(b.coin) === side.coin,
      );

      if (!balance) continue;

      currentOutcomePositions.push({
        coin: side.coin,
        sideIndex,
        sideName: side.name,
        entryPx:
          Number(balance.entryNtl) > 0
            ? Number(balance.entryNtl) / Number(balance.total)
            : 0,
        shares: Number(balance.total),
      });
    }

    return currentOutcomePositions;
  }, [balances, sides]);

  if (!openOrdersCount && !positions.length) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <OpenOrdersTag outcomeId={outcomeId} openOrdersCount={openOrdersCount} />

      {positions.map((position) => (
        <OpenPositionTag
          key={position.coin}
          position={position}
          activeOutcomeIndex={outcomeIndex}
        />
      ))}
    </div>
  );
};

export default OpenTradesTags;
