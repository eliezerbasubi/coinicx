import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketEventListingSkeleton from "@/features/predict/components/MarketEventListingSkeleton";
import PredictError from "@/features/predict/components/PredictError";
import { useMarketEvents } from "@/features/predict/hooks/useMarketEvents";
import { parseCategory } from "@/features/predict/lib/utils/parseMetadata";

import MarketEventCard from "./MarketEventCard";

const MarketEventsListing = () => {
  const { marketEvents, categories, error, isLoading } = useMarketEvents();
  const [currentCategory, setCurrentCategory] = useState("all");
  const [search, setSearch] = useState("");

  if (isLoading) {
    return <MarketEventListingSkeleton />;
  }

  if (error) {
    return (
      <PredictError
        title="Something went wrong"
        description="We're having trouble loading market events. Please try again later."
      />
    );
  }

  const marketsByCategory = useMemo(() => {
    if (currentCategory === "all") return marketEvents;

    return marketEvents.filter((event) =>
      event.categories.includes(currentCategory),
    );
  }, [currentCategory, marketEvents]);

  const filteredMarkets = useMemo(() => {
    if (!search) return marketsByCategory;

    return marketsByCategory.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [marketsByCategory, search]);

  return (
    <div className="w-full">
      <Tabs
        defaultValue="all"
        value={currentCategory}
        onValueChange={setCurrentCategory}
        className="relative"
      >
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="all" className="flex-0">
            All
          </TabsTrigger>
          {categories.map((category) => {
            if (category === "other") return null;
            const parsedCategory = parseCategory(category);

            return (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-0 capitalize text-sm"
              >
                {parsedCategory.type}
                {parsedCategory.period && ` (${parsedCategory.period})`}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="md:absolute right-0 w-full md:max-w-60 flex items-center h-8 px-2 rounded-lg border border-neutral-gray-200 hover:border-primary">
          <Search className="text-gray-600 size-4" />
          <input
            type="search"
            name="search"
            id="search"
            placeholder="Search"
            autoComplete="off"
            autoCorrect="off"
            className="size-full text-sm outline-none caret-primary pl-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-3 py-4">
        {filteredMarkets.map((event) => (
          <MarketEventCard key={event.coin} data={event} />
        ))}
      </div>
    </div>
  );
};

export default MarketEventsListing;
