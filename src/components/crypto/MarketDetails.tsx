import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoMarketContext } from "@/store/markets/hook";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import { useCurrentAssets } from "./hooks";
import { useExchangeRate } from "./hooks/useExchangeRate";

const MarketDetails = () => {
  // We convert crypto details data to current fiat current because we are fetching it in USD
  const { fiatAssetCode } = useCurrentAssets();
  const { exchangeRate } = useExchangeRate({
    baseCurrency: "usd",
    quoteCurrency: fiatAssetCode,
  });

  const data = useCryptoMarketContext(
    (s) => s.selectedAssets?.cryptoAssetDetails,
  );

  const formatNumberCurrency = (value: number) => {
    const amount = value * (exchangeRate?.value ?? 0);

    return formatNumber(amount, {
      style: "currency",
      currency: fiatAssetCode,
      notation: "compact",
    });
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <p className="font-bold text-2xl my-4">Markets</p>
        <div className="w-full grid md:grid-cols-3 gap-4">
          <MarketDetailItem
            title="Popularity"
            details={`#${data?.market_cap_rank ?? 1}`}
          />
          <MarketDetailItem
            title="Market Cap"
            details={formatNumberCurrency(data?.market_cap ?? 0)}
          />
          <MarketDetailItem
            title="Circulating Supply"
            details={formatNumber(data?.circulating_supply ?? 0, {
              notation: "compact",
            })}
          />
          <MarketDetailItem
            title="Volume"
            details={formatNumberCurrency(data?.total_volume ?? 0)}
          />
          <MarketDetailItem
            title="Fully Diluted Valuation"
            details={formatNumberCurrency(data?.fully_diluted_valuation ?? 0)}
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
  className?: string;
};

const MarketDetailItem = ({
  title,
  details,
  className,
}: MarketDetailItemProps) => {
  const isLoading = useCryptoMarketContext((s) => s.isLoadingAssets);

  return (
    <div className={cn("bg-neutral-gray-200 rounded-lg p-3", className)}>
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
      className={cn("bg-[#0080001c]", { "bg-[#ff120012]": value < 0 })}
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
