import { Asset } from "@/lib/types/trade";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useIsMobile } from "@/hooks/useIsMobile";
import TokenImage from "@/components/common/TokenImage";
import Visibility from "@/components/common/Visibility";
import Tag from "@/components/ui/tag";

import FavoriteButton from "../FavoriteButton";

type Props = {
  asset: Asset;
};

const AssetSymbolTile = ({ asset }: Props) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-x-2 md:gap-x-1">
      <FavoriteButton coin={asset.coin} />
      <Visibility visible={isMobile}>
        <TokenImage
          key={asset.coin}
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
            <Tag value="SPOT" className="text-2xs md:text-3xs" />
          </Visibility>

          <Visibility visible={!!asset.maxLeverage}>
            <Tag
              value={`${asset.maxLeverage}x`}
              className="text-2xs md:text-3xs"
            />
          </Visibility>
          <Visibility visible={!!asset.dex}>
            <Tag value={asset.dex} className="text-2xs md:text-3xs" />
          </Visibility>
        </div>

        <Visibility visible={isMobile}>
          <p className="space-x-1 text-3xs text-neutral-gray-400 font-medium">
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
