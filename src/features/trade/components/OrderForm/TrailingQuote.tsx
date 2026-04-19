import { useTradeContext } from "@/features/trade/store/hooks";

const TrailingQuote = () => {
  const quote = useTradeContext((s) => s.assetMeta.quote);

  return (
    <div className="flex items-center gap-x-2">
      <span className="text-neutral-300 text-3xs md:text-sm font-medium">
        {quote}
      </span>
    </div>
  );
};

export default TrailingQuote;
