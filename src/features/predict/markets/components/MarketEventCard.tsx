import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Repeat, Star } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { useOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsDesktop } from "@/hooks/useIsMobile";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { TradingWidgetMarketsDrawer } from "@/features/predict/components/TradingWidgetDrawer";
import { MarketEvent, SideSpec } from "@/features/predict/lib/types";
import { convertPeriodToMinutes } from "@/features/predict/lib/utils/parseMetadata";

const MarketEventDrawer = dynamic(
  () => import("@/features/predict/event/components/MarketEventDrawer"),
  { ssr: false },
);

type Props = {
  data: MarketEvent;
};

const MarketEventCard = ({ data }: Props) => {
  const recurringPayload = data.recurringPayload;

  // We consider a live event, an event that's less than 24 hours from now
  const isLive =
    !!recurringPayload?.period &&
    convertPeriodToMinutes(recurringPayload.period) < 24 * 60;

  const isDesktop = useIsDesktop({ initializeWithValue: false });

  const [open, setOpen] = useState(false);

  return (
    <div className="w-full flex flex-col min-h-[160px] shadow-md rounded-lg border border-neutral-gray-200 px-3 pt-3 pb-2 bg-neutral-gray-600">
      <div className="flex items-center gap-2">
        <Visibility visible={!!recurringPayload?.underlying}>
          <TokenImage
            key={recurringPayload?.underlying}
            name={recurringPayload?.underlying!}
            instrumentType="spot"
            className="size-9 rounded-lg"
          />
        </Visibility>
        <Link
          href={`${ROUTES.predict.event}/${data.slug}`}
          className="hover:underline"
          onClick={(e) => {
            if (!isDesktop) {
              e.preventDefault();

              setOpen(true);
            }
          }}
        >
          <p className="flex-1 text-sm font-medium line-clamp-2">
            {data.title}
          </p>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-end gap-1.5 w-full mt-2">
        {/* Categorical outcomes */}
        <Visibility visible={data.type === "categorical"}>
          <div className="space-y-2 h-[71px] overflow-y-auto no-scrollbars">
            {data.outcomes.map((outcome, outcomeIndex) => (
              <div
                key={outcome.outcome}
                className="w-full flex justify-between items-center gap-2"
              >
                <div className="flex-1 flex items-center justify-between">
                  <p
                    className="text-sm"
                    onClick={(e) => {
                      if (!isDesktop) {
                        e.preventDefault();
                        e.stopPropagation();

                        setOpen(true);
                      }
                    }}
                  >
                    {outcome.title}
                  </p>
                  <p className="text-xs font-medium">
                    {/* Yes side is always the same as the outcome. So, we pick only the first side which is yes */}
                    {formatNumber(
                      ((outcome.sides[0].midPx || outcome.sides[0].markPx) *
                        100) /
                        100,
                      {
                        style: "percent",
                      },
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {outcome.sides.map((side, index) => (
                    <SideButton
                      key={side.coin}
                      side={side}
                      outcomeIndex={outcomeIndex}
                      sideIndex={index}
                      data={data}
                      className="w-fit h-[27px]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Visibility>

        {/* Binary outcomes */}
        <div className="grid grid-cols-2 gap-2">
          {data.sides.map((side, index) => (
            <SideButton
              key={side.coin}
              side={side}
              sideIndex={index}
              data={data}
            />
          ))}
        </div>
        <div className="w-full flex items-center justify-between text-sm text-neutral-gray-400">
          <div className="flex-1">
            <Visibility visible={isLive}>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div className="size-[7px] rounded-full bg-red-500 relative z-10" />
                  <div className="absolute -inset-px size-[9px] rounded-full bg-red-500 opacity-75 animate-ping" />
                </div>
                <p className="uppercase text-red-500 text-sm">Live</p>

                <p className="text-xs font-medium flex items-center gap-0.5">
                  <Repeat className="size-3 stroke-3" />
                  <span>{recurringPayload?.period}</span>
                </p>
              </div>
            </Visibility>
            <Visibility visible={!isLive}>
              <p className="text-xs font-medium">
                <span>
                  {formatNumber(data.volume, {
                    style: "currency",
                    notation: "compact",
                  })}
                </span>
                <span className="ml-1">Vol</span>
              </p>
            </Visibility>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 flex items-center justify-center"
            >
              <Star className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Show the full market event drawer on mobile */}
      <Visibility visible={!isDesktop}>
        <MarketEventDrawer
          open={open}
          onOpenChange={setOpen}
          slug={data.slug}
          type={data.type}
          title={data.title}
        />
      </Visibility>
    </div>
  );
};

const SideButton = ({
  side,
  sideIndex,
  data,
  className,
  outcomeIndex,
}: {
  side: SideSpec;
  sideIndex: number;
  data: MarketEvent;
  outcomeIndex?: number;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        className={cn(
          "bg-buy/10 text-buy hover:bg-buy hover:text-white",
          {
            "bg-sell/10 text-sell hover:bg-sell hover:text-white":
              sideIndex === 1,
          },
          className,
        )}
        onClick={() => {
          setOpen(true);
          useOrderFormStore.getState().setPredictSideIndex(sideIndex);
        }}
      >
        {side.name}
      </Button>

      <TradingWidgetMarketsDrawer
        open={open}
        onOpenChange={setOpen}
        marketEventMeta={mapMarketEventToMeta({ ...data, coin: side.coin })}
        outcomeIndex={outcomeIndex}
      />
    </>
  );
};

const mapMarketEventToMeta = (data: MarketEvent) => {
  return {
    title: data.title,
    type: data.type,
    outcome: data.outcome,
    slug: data.slug,
    sides: data.sides,
    outcomes: data.outcomes,
    coin: data.coin,
    categories: data.categories,
    questionId: data.questionId,
    recurringPayload: data.recurringPayload,
    settledOutcomes: data.settledOutcomes,
    description: data.description,
    status: data.status,
  };
};

export default MarketEventCard;
