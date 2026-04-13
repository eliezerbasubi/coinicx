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

import MarketEventOrderbook from "../MarketEventOrderbook";
import OutcomeGraph from "../OutcomeGraph";
import MarketEventTile from "./MarketEventTile";

const MarketEventDrawer = dynamic(() => import("../MarketEventOutcomeDrawer"), {
  ssr: false,
});

const CategoricalOutcomes = () => {
  const isLaptop = useIsLaptop();

  const { marketEventMeta, marketEventCtx, setActiveOutcomeIndex } =
    useMarketEventContext((s) => ({
      marketEventMeta: s.marketEventMeta,
      marketEventCtx: s.marketEventCtx,
      setActiveOutcomeIndex: s.setActiveOutcomeIndex,
    }));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>();

  if (marketEventMeta.type !== "categorical") return null;

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
        className="w-full mt-4 space-y-1"
      >
        {marketEventMeta.outcomes.map((outcome, index) => {
          return (
            <AccordionItem
              key={outcome.coin}
              value={outcome.coin}
              className="not-last:border-0 bg-neutral-gray-600 rounded-md"
            >
              <Button
                variant="ghost"
                aria-controls={outcome.coin}
                aria-expanded={value === outcome.coin}
                data-state={value === outcome.coin ? "open" : "closed"}
                data-orientation="vertical"
                id={outcome.coin}
                data-slot="accordion-trigger"
                data-radix-collection-item
                className="h-fit p-0"
                onClick={() => {
                  setActiveOutcomeIndex(index);

                  if (!isLaptop) {
                    setOpen(true);
                    setValue(undefined);
                  } else {
                    setValue(value === outcome.coin ? undefined : outcome.coin);
                  }
                }}
              >
                <MarketEventTile outcome={outcome} outcomeIndex={index} />
              </Button>
              <AccordionContent className="h-auto m-px bg-primary-dark">
                <Tabs defaultValue="orderbook" className="w-full">
                  <TabsList variant="line" className="w-full">
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
                  <TabsContent value="orderbook">
                    <MarketEventOrderbook outcomeSides={outcome.sides} />
                  </TabsContent>
                  <TabsContent value="graph">
                    <OutcomeGraph
                      outcomeMeta={outcome}
                      sidesCtxs={marketEventCtx.outcomes[index]?.sides ?? []}
                    />
                  </TabsContent>
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
        <MarketEventDrawer open={open} onOpenChange={setOpen} />
      </Visibility>
    </>
  );
};

export default CategoricalOutcomes;
