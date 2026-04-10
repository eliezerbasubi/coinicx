import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketEventContext } from "@/features/predict/store/market-event/hooks";

import MarketEventOrderbook from "../MarketEventOrderbook";
import MarketEventTile from "./MarketEventTile";
import OutcomeGraph from "./OutcomeGraph";

const CategoricalOutcomes = () => {
  const { marketEventMeta, marketEventCtx, setActiveOutcomeIndex } =
    useMarketEventContext((s) => ({
      marketEventMeta: s.marketEventMeta,
      marketEventCtx: s.marketEventCtx,
      setActiveOutcomeIndex: s.setActiveOutcomeIndex,
    }));

  if (marketEventMeta.type !== "categorical") return null;

  return (
    <Accordion type="single" collapsible className="w-full mt-4 space-y-1">
      {marketEventMeta.outcomes.map((outcome, index) => {
        return (
          <AccordionItem
            key={outcome.coin}
            value={outcome.coin}
            className="not-last:border-0 bg-neutral-gray-600 rounded-md"
          >
            <AccordionTrigger
              hideArrow
              onClick={() => setActiveOutcomeIndex(index)}
              className="border-0 hover:no-underline py-0"
            >
              <MarketEventTile outcome={outcome} outcomeIndex={index} />
            </AccordionTrigger>
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
  );
};

export default CategoricalOutcomes;
