"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { usePreferencesStore } from "@/lib/store/trade/user-preferences";
import { useShallowUserTradeStore } from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { parseBuilderDeployedAsset } from "@/features/trade/utils";

const MAX_DISPLAY_POSITIONS = 4;

const PositionsOverview = () => {
  const assetPositions = useShallowUserTradeStore(
    (s) => s.allDexsClearinghouseState?.assetPositions,
  );

  const positions = assetPositions ?? [];

  if (!positions.length) return null;

  return (
    <div className="w-full mt-4 mb-1">
      <p className="text-sm text-neutral-gray-400 font-medium mb-2">
        Positions
      </p>

      <div className="w-full p-2.5 bg-neutral-gray-600 rounded-lg">
        {positions.slice(0, MAX_DISPLAY_POSITIONS).map((datum) => {
          const position = datum.position;
          const isLong = Number(position.szi) > 0;
          const asset = parseBuilderDeployedAsset(position.coin);

          return (
            <Link
              key={position.coin}
              href={`${ROUTES.trade.perps}/${position.coin}`}
              onClick={() => {
                usePreferencesStore
                  .getState()
                  .dispatch({ mobileViewTab: "trade", activeTab: "positions" });
              }}
              className="w-full flex items-center justify-between py-1.5 first:pt-0 last:pb-0 gap-2"
            >
              <TokenImage
                name={asset.base}
                coin={position.coin}
                instrumentType="perps"
                className="size-6 rounded-full"
              />
              <div className="flex-1 text-white text-sm">
                <div className="flex items-center flex-wrap gap-x-2">
                  <p className="font-semibold">{asset.base}</p>
                  <Tag
                    value={`${isLong ? "Long" : "Short"} ${position.leverage.value}x`}
                    className={cn("text-buy bg-buy/10 capitalize", {
                      "text-sell bg-sell/10": !isLong,
                    })}
                  />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <p className="text-xs text-white font-semibold">
                  {formatNumber(Number(position.positionValue), {
                    style: "currency",
                  })}
                </p>
                <div className="flex items-center gap-x-1 text-xs">
                  <p
                    className={cn("text-buy font-medium", {
                      "text-sell": Number(position.returnOnEquity) < 0,
                    })}
                  >
                    {formatNumber(Number(position.unrealizedPnl), {
                      style: "currency",
                      useSign: true,
                    })}
                  </p>
                  <p
                    className={cn("text-buy font-semibold", {
                      "text-sell": Number(position.returnOnEquity) < 0,
                    })}
                  >
                    (
                    {formatNumber(Number(position.returnOnEquity), {
                      style: "percent",
                      useSign: true,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </p>
                </div>
              </div>
              <ChevronRight className="text-neutral-gray-400 size-5" />
            </Link>
          );
        })}

        <Visibility visible={positions.length > MAX_DISPLAY_POSITIONS}>
          <Button
            variant="ghost"
            className="h-fit text-neutral-gray-400 text-sm p-0"
            onClick={() => {
              usePreferencesStore
                .getState()
                .dispatch({ mobileViewTab: "trade", activeTab: "positions" });
            }}
          >
            View All
          </Button>
        </Visibility>
      </div>
    </div>
  );
};

export default React.memo(PositionsOverview);
