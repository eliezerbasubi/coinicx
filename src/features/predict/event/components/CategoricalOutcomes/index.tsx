import { useState } from "react";
import dynamic from "next/dynamic";

import { useIsLaptop } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";
import { useShallowUserPredictionStore } from "@/features/predict/lib/store/user-prediction";

import MarketEventOpenOrdersTable from "../MarketEventOpenOrders/MarketEventOpenOrdersTable";
import MarketEventOrderbook from "../MarketEventOrderbook";
import MarketEventPositionsTable from "../MarketEventPositions/MarketEventPositionsTable";
import OutcomeGraph from "../OutcomeGraph";
import MarketEventTile from "./MarketEventTile";

const MarketEventOutcomeDrawer = dynamic(
  () => import("../MarketEventOutcomeDrawer"),
  {
    ssr: false,
  },
);

const CategoricalOutcomes = () => {
  const isLaptop = useIsLaptop({ initializeWithValue: false });

  const { marketEventMeta, marketEventCtx, setActiveOutcomeIndex } =
    useMarketEventContext((s) => ({
      marketEventMeta: s.marketEventMeta,
      marketEventCtx: s.marketEventCtx,
      setActiveOutcomeIndex: s.setActiveOutcomeIndex,
    }));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("default");

  if (marketEventMeta.type !== "categorical") return null;

  const { openOrders, predictionBalances } = useShallowUserPredictionStore(
    (s) => ({
      predictionBalances: s.predictionBalances,
      openOrders: s.openOrders,
    }),
  );

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={value}
        defaultValue="orderbook"
        onValueChange={setValue}
        className="w-full mt-4 space-y-1"
      >
        {marketEventMeta.outcomes.map((outcome, index) => {
          const hasOrders = !!openOrders.get(outcome.outcome)?.length;
          const hasPosition = !!predictionBalances.get(outcome.outcome)?.length;

          return (
            <AccordionItem
              key={outcome.coin}
              value={outcome.coin}
              className="not-last:border-0 bg-neutral-gray-600 rounded-md"
            >
              <Button
                asChild
                variant="ghost"
                aria-controls={outcome.coin}
                aria-expanded={value === outcome.coin}
                data-state={value === outcome.coin ? "open" : "closed"}
                data-orientation="vertical"
                id={outcome.coin}
                data-slot="accordion-trigger"
                data-radix-collection-item
                className="h-fit p-3 block cursor-pointer"
                onClick={() => {
                  setActiveOutcomeIndex(index);

                  if (!isLaptop) {
                    setOpen(true);
                    setValue("default");
                  } else {
                    setValue(value === outcome.coin ? "default" : outcome.coin);
                  }
                }}
              >
                <MarketEventTile outcome={outcome} outcomeIndex={index} />
              </Button>
              <AccordionContent className="h-auto m-px bg-primary-dark">
                <Tabs defaultValue="orderbook" className="w-full">
                  <TabsList variant="line" className="w-full">
                    <Visibility visible={hasPosition}>
                      <TabsTrigger value="positions" className="flex-0">
                        Positions
                      </TabsTrigger>
                    </Visibility>

                    <Visibility visible={hasOrders}>
                      <TabsTrigger value="openOrders" className="flex-0">
                        Open Orders
                      </TabsTrigger>
                    </Visibility>

                    <TabsTrigger value="orderbook" className="flex-0">
                      Order Book
                    </TabsTrigger>

                    <TabsTrigger value="graph" className="flex-0">
                      Graph
                    </TabsTrigger>

                    <TabsTrigger value="details" className="flex-0">
                      Details
                    </TabsTrigger>
                  </TabsList>

                  {/* Positions */}
                  <TabsContent value="positions" className="min-h-80">
                    <MarketEventPositionsTable outcomeMeta={outcome} />
                  </TabsContent>

                  {/* Open Orders */}
                  <TabsContent value="openOrders" className="min-h-80">
                    <MarketEventOpenOrdersTable outcomeMeta={outcome} />
                  </TabsContent>

                  {/* Orderbook */}
                  <TabsContent value="orderbook">
                    <MarketEventOrderbook
                      outcomeCoin={outcome.coin}
                      outcomeSides={outcome.sides}
                    />
                  </TabsContent>

                  {/* Chart */}
                  <TabsContent value="graph">
                    <OutcomeGraph
                      outcomeMeta={outcome}
                      sidesCtxs={marketEventCtx.outcomes[index]?.sides ?? []}
                    />
                  </TabsContent>

                  {/* Resolution or Details */}
                  <TabsContent value="details" className="min-h-80 p-4">
                    <p>{outcome.description}</p>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* We're putting the drawer outside the accordion cause the accordion is retaining state
       causing both the content and the drawer to open */}
      <Visibility visible={!isLaptop}>
        <MarketEventOutcomeDrawer open={open} onOpenChange={setOpen} />
      </Visibility>
    </>
  );
};

export default CategoricalOutcomes;
