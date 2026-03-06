import { Star } from "lucide-react";

import { Asset } from "@/types/trade";
import { useIsMobile } from "@/hooks/useIsMobile";
import Visibility from "@/components/common/Visibility";
import Tag from "@/components/ui/tag";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";
import { useFavoriteStore } from "./store";

type Props = {
  asset: Asset;
};

const AssetSymbolTile = ({ asset }: Props) => {
  const isMobile = useIsMobile();
  const { favourites, toggleFavourite } = useFavoriteStore();

  const isFavourite = favourites.includes(asset.coin);

  return (
    <div className="flex items-center gap-x-2 md:gap-x-1">
      <Star
        role="button"
        className={cn("size-3 text-neutral-gray-400", {
          "fill-primary text-primary": isFavourite,
        })}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavourite(asset.coin);
        }}
      />
      <Visibility visible={isMobile}>
        <TokenImage
          name={asset.base}
          coin={asset.coin}
          instrumentType={asset.isSpot ? "spot" : "perps"}
          className="bg-neutral-gray-200 border border-neutral-gray-200 text-trade-dark size-6 md:size-5"
        />
      </Visibility>
      <div className="flex-1">
        <div className="flex items-center gap-x-1">
          <p>{asset.symbol}</p>
          <Visibility visible={asset.isSpot}>
            <Tag value="SPOT" />
          </Visibility>

          <Visibility visible={!!asset.maxLeverage}>
            <Tag value={`${asset.maxLeverage}x`} />
          </Visibility>
          <Visibility visible={!!asset.dex}>
            <Tag value={asset.dex} />
          </Visibility>
        </div>

        <Visibility visible={isMobile}>
          <p className="space-x-1 text-[11px] text-neutral-gray-400 font-medium">
            <span>Vol.</span>
            <span>
              {formatNumber(asset.dayNtlVlm, {
                style: "currency",
                useFallback: true,
              })}
            </span>
          </p>
        </Visibility>
      </div>
    </div>
  );
};

export default AssetSymbolTile;
