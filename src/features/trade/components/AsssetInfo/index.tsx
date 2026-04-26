import React from "react";
import { useQuery } from "@tanstack/react-query";

import { hlInfoClient } from "@/lib/services/transport";
import { cn } from "@/lib/utils/cn";
import { formatAddress } from "@/lib/utils/formatting/formatAddress";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import { useTradeContext } from "@/features/trade/store/hooks";

const AssetInfo = () => {
  const { tokenMeta, instrumentType } = useTradeContext((s) => ({
    tokenMeta: s.assetMeta,
    instrumentType: s.instrumentType,
  }));

  const { data } = useQuery({
    enabled: !!tokenMeta && !!tokenMeta.dex && !!tokenMeta.coin,
    queryKey: ["perpAnnotation", tokenMeta.coin],
    staleTime: Infinity,
    queryFn: () => hlInfoClient.perpAnnotation({ coin: tokenMeta?.coin ?? "" }),
  });

  if (!tokenMeta) return null;

  const marketOrderValue = getMarketOrderValue(tokenMeta.maxLeverage);

  return (
    <div className="w-full xl:w-[calc(100vw-650px)] h-96 md:h-85 lg:h-125 group-fullscreen/market:lg:w-full group-fullscreen/market:xl:w-full">
      <div className="size-full mx-auto max-w-2xl px-4 pt-4 md:pt-0 flex flex-col md:justify-center space-y-4">
        <div
          role="button"
          tabIndex={0}
          className="hidden md:flex items-center space-x-2 cursor-pointer"
        >
          <TokenImage
            key={`${tokenMeta.base}-${tokenMeta.coin}`}
            name={tokenMeta.base}
            coin={tokenMeta.coin}
            instrumentType={instrumentType}
            className="size-5 md:size-8"
          />

          <p className="text-white font-semibold">
            {tokenMeta.fullName ?? tokenMeta.symbol}
          </p>
        </div>

        <Visibility visible={!!data?.description}>
          <p className="text-sm text-white">{data?.description}</p>
        </Visibility>

        <div className="w-full space-y-4">
          <Visibility visible={!!data?.category}>
            <AssetInfoTile
              label="Category"
              value={data?.category ?? ""}
              className="capitalize"
            />
          </Visibility>

          <AssetInfoTile
            label="Min Order Size"
            value={`10 ${tokenMeta.quote}`}
          />
          <AssetInfoTile
            label="Max Market Order Value"
            value={formatNumber(marketOrderValue, { style: "currency" })}
          />
          <AssetInfoTile
            label="Max Limit Order Value"
            value={formatNumber(10 * marketOrderValue, { style: "currency" })}
          />
          <AssetInfoTile
            label="Max Number of Orders"
            value={formatNumber(4_000)}
          />
          <Visibility visible={tokenMeta.dex !== null}>
            <AssetInfoTile
              label="Funding Impact Notional"
              value={`${formatNumber(getFundingImpactNotional(tokenMeta.base))} USDC`}
            />
          </Visibility>
          <Visibility visible={!!tokenMeta.tokenId}>
            <AssetInfoTile
              label="Contract"
              value={formatAddress(tokenMeta.tokenId!, 6)}
            />
          </Visibility>
        </div>
      </div>
    </div>
  );
};

const AssetInfoTile = ({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-xs md:text-sm",
        className,
      )}
    >
      <div className="text-neutral-gray-400">{label}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
  );
};

const getMarketOrderValue = (maxLeverage: number): number => {
  if (maxLeverage >= 25) return 15_000_000;
  if (maxLeverage > 20 && maxLeverage < 25) return 5_000_000;
  if (maxLeverage > 10 && maxLeverage < 20) return 2_000_000;
  return 500_000;
};

/**
 * Returns the maximum USDC notional value for a funding impact
 *
 * @param baseAsset The base asset of the instrument
 * @returns The maximum USDC notional value for a funding impact
 */
const getFundingImpactNotional = (baseAsset: string): number => {
  if (baseAsset === "ETH" || baseAsset === "BTC") return 20_000;
  return 6_000;
};

export default AssetInfo;
