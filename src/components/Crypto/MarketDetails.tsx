import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoMarketContext } from "@/store/markets/hook";
import { cn } from "@/utils/cn";

import { useCurrentCryptoCurrency } from "./hooks";

const MarketDetails = () => {
  const data = useCurrentCryptoCurrency();

  return (
    <div className="w-full">
      <div className="w-full">
        <p className="font-bold text-2xl my-4">Markets</p>
        <div className="w-full grid md:grid-cols-3 gap-4">
          <MarketDetailItem
            title="Popularity"
            details={`#${data?.market_cap_rank}`}
          />
          <MarketDetailItem
            title="Market Cap"
            details={(data?.market_cap ?? 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            })}
          />
          <MarketDetailItem
            title="Circulating Supply"
            details={(data?.circulating_supply ?? 0).toLocaleString("en-US", {
              notation: "compact",
            })}
          />
          <MarketDetailItem
            title="Volume"
            details={(data?.total_volume ?? 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            })}
          />
          <MarketDetailItem
            title="Fully Diluted Valuation (FDV)"
            details={(data?.fully_diluted_valuation ?? 0).toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: "USD",
                notation: "compact",
              },
            )}
          />
        </div>
      </div>
      <div className="w-full">
        <p className="font-bold text-2xl my-4">Conversion Tables</p>
        <div className="w-full grid md:grid-cols-3 gap-4">
          <ConversionItem
            title="24-hour exchange rate"
            value={data?.price_change_percentage_24h ?? 0}
          />
          <ConversionItem
            title="24-hour market cap rate"
            value={data?.price_change_percentage_24h ?? 0}
          />
          <ConversionItem
            title="All Time High rate"
            value={data?.ath_change_percentage ?? 0}
          />
          <ConversionItem
            title="All Time Low rate"
            value={data?.atl_change_percentage ?? 0}
          />
        </div>
      </div>
    </div>
  );
};

type MarketDetailItemProps = {
  title: string;
  details: React.ReactNode;
};

const MarketDetailItem = ({ title, details }: MarketDetailItemProps) => {
  const isLoading = useCryptoMarketContext((s) => s.isLoadingAssets);

  return (
    <div className="bg-neutral-gray-200 rounded-lg p-3">
      <p className="text-sm text-neutral-gray-400 font-medium">{title}</p>

      <div className="font-bold mt-1">
        {(isLoading && <Skeleton />) || details}
      </div>
    </div>
  );
};

const ConversionItem = ({ title, value }: { title: string; value: number }) => {
  return (
    <MarketDetailItem
      title={title}
      details={
        <p className={cn("text-green-400", { "text-red-400": value < 0 })}>
          {value >= 0 && "+"}
          {value.toFixed(2)}%
        </p>
      }
    />
  );
};

export default MarketDetails;
