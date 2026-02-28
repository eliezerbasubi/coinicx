import React from "react";

import Visibility from "@/components/common/Visibility";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { cn } from "@/utils/cn";
import { formatAddress } from "@/utils/formatting/formatAddress";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

const AssetInfo = () => {
  const { tokenMeta } = useShallowInstrumentStore((state) => ({
    tokenMeta: state.assetMeta,
  }));

  if (!tokenMeta) return null;

  const marketOrderValue = getMarketOrderValue(tokenMeta.maxLeverage);

  return (
    <div className="w-full lg:w-[calc(100vw-300px)] xl:w-[calc(100vw-650px)] h-125 group-fullscreen/chart:lg:w-full group-fullscreen/chart:xl:w-full">
      <div className="size-full mx-auto max-w-2xl px-4 flex flex-col justify-center">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center space-x-2 cursor-pointer mb-4"
        >
          <TokenImage
            key={tokenMeta.base}
            name={tokenMeta.base}
            instrumentType={tokenMeta.dex === null ? "spot" : "perps"}
            className="size-5 md:size-8"
          />

          <p className="text-white font-semibold">
            {tokenMeta.fullName ?? tokenMeta.symbol}
          </p>
        </div>

        <div className="w-full space-y-4">
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
    <div className={cn("flex items-center justify-between text-sm", className)}>
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

const getLimitOrderValue = (maxLeverage: number): number => {
  return 10 * getMarketOrderValue(maxLeverage);
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
