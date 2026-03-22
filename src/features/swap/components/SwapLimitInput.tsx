import { cn } from "@/lib/utils/cn";
import TokenImage from "@/components/common/TokenImage";
import { InputNumber } from "@/components/ui/input-number";

import { useShallowSwapStore } from "../store";
import { isQuoteAsset, midPrice } from "../utils/swap";

type Props = {
  value: string;
  tokenName?: string;
  onValueChange?: (value: string) => void;
};

const PERCENTAGES = [100, 1, 5, 10]; // 100 represents "Market" price

const SwapLimitInput = ({ value, tokenName, onValueChange }: Props) => {
  const { sellToken, sellBook, buyBook } = useShallowSwapStore((s) => ({
    sellToken: s.sellToken,
    sellBook: s.sellBook,
    buyBook: s.buyBook,
  }));

  const isSellMarket = sellToken ? !isQuoteAsset(sellToken.name) : false;

  const getCurrentMid = () => {
    const book = sellBook || buyBook;
    if (!book) return 0;
    return midPrice(book.bids, book.asks);
  };

  const onPercentageChange = (percent: number) => {
    const mid = getCurrentMid();
    if (!mid) return;

    if (percent === 100) {
      onValueChange?.(mid.toString());
      return;
    }

    const factor = percent / 100;
    // For sell market (user sells base): decrease price (-%)
    // For buy market (user sells quote): increase price (+%)
    const adjusted = isSellMarket ? mid * (1 - factor) : mid * (1 + factor);

    onValueChange?.(adjusted.toString());
  };

  const validate = (val: string) => {
    const price = parseFloat(val);
    const mid = getCurrentMid();
    if (!price || !mid) return true;

    // Buy market: price should not be below current mid
    // Sell market: price should not be above current mid
    if (isSellMarket && price > mid) return false;
    if (!isSellMarket && price < mid) return false;
    return true;
  };

  const isValid = validate(value);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "w-full min-h-32 border border-neutral-gray-200 focus-within:border-primary rounded-xl p-4 transition-colors duration-500 ease-in-out cursor-pointer",
        { "border-red-500/50": !isValid },
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-gray-400">Limit Price</p>
        {!isValid && (
          <p className="text-xs text-red-500 font-medium">
            {isSellMarket
              ? "Price must be at or below market"
              : "Price must be at or above market"}
          </p>
        )}
      </div>

      <div className="w-full flex items-center justify-between gap-x-2 py-1">
        <InputNumber
          value={value}
          placeholder="0"
          className={cn(
            "w-fit min-w-0 appearance-none outline-0 h-12 text-4xl font-bold placeholder:text-neutral-gray-400 text-white",
            { "text-red-500": !isValid },
          )}
          onChange={(e) => onValueChange?.(e.target.value)}
        />

        {tokenName && (
          <button className="flex items-center gap-1 p-0.5 text-white rounded-full transition-colors duration-500 ease-in-out cursor-pointer">
            <TokenImage
              key={tokenName}
              instrumentType="spot"
              name={tokenName}
              className="size-5 text-foreground"
            />
            <p className="text-sm font-semibold">{tokenName}</p>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-x-1 transition-opacity duration-500 ease-in-out">
          {PERCENTAGES.map((percent) => {
            const isMarket = percent === 100;
            const prefix = isMarket ? "" : isSellMarket ? "-" : "+";

            return (
              <button
                type="button"
                key={percent}
                className={cn(
                  "min-w-0 basis-auto border border-neutral-gray-200 rounded-lg py-0.5 px-1.5 text-neutral-gray-400 font-medium text-xs cursor-pointer disabled:bg-neutral-gray-600 active:bg-neutral-gray-600 disabled:cursor-not-allowed",
                )}
                onClick={() => onPercentageChange(percent)}
              >
                {isMarket ? "Market" : `${prefix}${percent}%`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SwapLimitInput;
