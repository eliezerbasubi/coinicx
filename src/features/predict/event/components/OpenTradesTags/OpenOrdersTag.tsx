"use client";

import { X } from "lucide-react";

import { InstrumentType } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { useUserPredictionStore } from "@/features/predict/lib/store/user-prediction";
import { useCancelOrder } from "@/features/trade/hooks/useCancelOrder";

type Props = {
  outcomeId: number;
  openOrdersCount: number;
};

const OpenOrdersTag = ({ outcomeId, openOrdersCount }: Props) => {
  const { processing, cancelOrder } = useCancelOrder();

  if (!openOrdersCount) return null;

  return (
    <Tag
      className="space-x-1 flex items-center group/order"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 space-x-1">
        <span>{openOrdersCount}</span>
        <span>open order{openOrdersCount > 1 ? "s" : ""}</span>
      </div>

      <Button
        size="sm"
        variant="ghost"
        disabled={processing}
        loading={processing}
        onClick={(e) => {
          e.stopPropagation();

          const openOrders = useUserPredictionStore
            .getState()
            .openOrders.get(outcomeId)
            ?.map((order) => ({
              coin: order.coin,
              oid: order.oid,
              type: "prediction" as InstrumentType,
            }));

          if (!openOrders) return;

          cancelOrder(openOrders);
        }}
        className={cn(
          "p-0! size-fit block lg:hidden group-hover/order:block [&>svg]:size-3! [&>svg]:stroke-2!",
          { "lg:block": processing },
        )}
      >
        {!processing && <X />}
      </Button>
    </Tag>
  );
};

export default OpenOrdersTag;
