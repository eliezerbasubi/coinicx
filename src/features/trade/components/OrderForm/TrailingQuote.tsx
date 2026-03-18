import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";

const TrailingQuote = () => {
  const quote = useShallowInstrumentStore((s) => s.assetMeta?.quote);

  return (
    <div className="flex items-center gap-x-2">
      <span className="text-neutral-300 text-3xs md:text-sm font-medium">
        {quote}
      </span>
    </div>
  );
};

export default TrailingQuote;
