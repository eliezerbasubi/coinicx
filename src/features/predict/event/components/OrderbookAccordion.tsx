import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { cn } from "@/lib/utils/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useMarketEventContext } from "@/features/predict/lib/store/market-event/hooks";

import MarketEventOrderbook from "./MarketEventOrderbook";

const OrderbookAccordion = () => {
  const marketEventMeta = useMarketEventContext((s) => s.marketEventMeta);

  const { predictSideIndex, setPredictSideIndex } = useShallowOrderFormStore(
    (s) => ({
      predictSideIndex: s.predictSideIndex,
      setPredictSideIndex: s.setPredictSideIndex,
    }),
  );

  if (marketEventMeta.type === "categorical") return null;

  return (
    <Accordion
      type="single"
      collapsible
      className="mt-4 bg-neutral-gray-600 rounded-xl overflow-hidden"
    >
      <AccordionItem value="orderbook" className="isolate">
        <AccordionTrigger className="py-6 px-4 text-white border-0 hover:no-underline">
          <p className="text-base font-semibold">Order Book</p>
        </AccordionTrigger>
        <AccordionContent className="bg-primary-dark m-px">
          <div className="flex items-center gap-3 px-4">
            {marketEventMeta.sides.map((side, index) => (
              <Button
                key={side.coin}
                variant="ghost"
                className={cn(
                  "w-fit px-0 text-sm font-medium text-neutral-gray-400 hover:text-white",
                  {
                    "text-white": predictSideIndex === index,
                  },
                )}
                onClick={() => setPredictSideIndex(index)}
              >
                Trade {side.name}
              </Button>
            ))}
          </div>
          <MarketEventOrderbook outcomeSides={marketEventMeta.sides} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OrderbookAccordion;
