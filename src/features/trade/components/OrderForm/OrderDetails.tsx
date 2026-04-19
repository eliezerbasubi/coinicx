import { useMemo } from "react";

import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { useOrderBookStore } from "@/lib/store/trade/orderbook";
import { useUserTradeStore } from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import { useMaxTradeSz } from "@/hooks/useAvailableToTrade";
import Visibility from "@/components/common/Visibility";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { DEFAULT_ORDER_MAX_SLIPPAGE } from "@/features/trade/constants";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import { useUserFees } from "@/features/trade/hooks/useUserFees";
import { useTradeContext } from "@/features/trade/store/hooks";
import {
  estimateLiquidationPrice,
  estimateSlippagePercent,
  formatPriceToDecimal,
} from "@/features/trade/utils";
import {
  calculateNumberOfOrders,
  calculateSubOrderSize,
} from "@/features/trade/utils/twap";

export const LiquidationPrice = ({ size }: { size: number }) => {
  const { isPerps, assetMeta, assetCtx } = useTradeContext((s) => ({
    isPerps: s.instrumentType === "perps",
    assetMeta: s.assetMeta,
    assetCtx: s.assetCtx,
  }));

  const { perpMetas } = useAssetMetas();

  const { limitPrice, isBuyOrder, maxSlippage, reduceOnly, orderType } =
    useShallowOrderFormStore((s) => ({
      limitPrice: s.limitPrice,
      isBuyOrder: s.orderSide === "buy",
      maxSlippage: s.settings.maxSlippage || DEFAULT_ORDER_MAX_SLIPPAGE,
      reduceOnly: s.settings.reduceOnly,
      orderType: s.settings.orderType,
    }));

  const liquidationPrice = useMemo(() => {
    const leverage = useUserTradeStore.getState().activeAssetData?.leverage;

    if (
      !isPerps ||
      !leverage ||
      !perpMetas ||
      assetMeta?.perpDexIndex === undefined ||
      reduceOnly
    )
      return 0;

    const perpDexState = perpMetas[assetMeta.perpDexIndex];
    const perpAssetMeta = perpDexState.universe[assetMeta.index];

    if (!assetMeta.dex) return 0;

    const clearinghouseState = useUserTradeStore
      .getState()
      .clearinghouseStates.get(assetMeta.dex);

    if (!clearinghouseState) return 0;

    return estimateLiquidationPrice({
      leverage,
      assetName: assetMeta.coin,
      entryPrice: limitPrice ? parseFloat(limitPrice) : assetCtx?.markPx || 0,
      midPx: assetCtx?.midPx || 0,
      maxLeverage: perpAssetMeta.maxLeverage,
      orderSize: size,
      clearinghouseState,
      isBuyOrder,
    });
  }, [
    size,
    limitPrice,
    assetCtx.markPx,
    isPerps,
    assetMeta.coin,
    assetMeta.perpDexIndex,
    perpMetas,
    reduceOnly,
    maxSlippage,
    isBuyOrder,
  ]);

  if (!isPerps || orderType === "scale" || orderType === "twap") return null;

  return (
    <div className="w-full flex items-center justify-between">
      <AdaptiveTooltip
        variant="underline"
        title="Liquidation Price"
        trigger={<DetailsLabel>Liquidation Price</DetailsLabel>}
        className="break-after-avoid"
      >
        <p>
          The liquidation price is the price at which your position will be
          liquidated if it is not closed.
        </p>
      </AdaptiveTooltip>

      <DetailsValue>
        {formatPriceToDecimal(liquidationPrice || 0, assetMeta.pxDecimals, {
          style: "currency",
          useFallback: true,
        })}
      </DetailsValue>
    </div>
  );
};

export const OrderValueAndMarginRequired = ({
  data,
}: {
  data: { orderValue: number; marginRequired: number };
}) => {
  const { isPerp, quote } = useTradeContext((s) => ({
    isPerp: s.instrumentType === "perps",
    quote: s.assetMeta.quote,
  }));
  const orderType = useShallowOrderFormStore((s) => s.settings.orderType);

  if (orderType === "twap") return null;

  return (
    <>
      <DetailsTile
        label="Order Value"
        value={formatNumber(data.orderValue, {
          useFallback: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          symbol: quote,
        })}
      />
      <Visibility visible={isPerp}>
        <DetailsTile
          label="Margin"
          value={formatNumber(data.marginRequired, {
            useFallback: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            symbol: quote,
          })}
        />
      </Visibility>
    </>
  );
};

export const MaxOrderSize = () => {
  const { isPerp, base } = useTradeContext((s) => ({
    isPerp: s.instrumentType === "perps",
    base: s.assetMeta.base,
  }));
  const isBuyOrder = useShallowOrderFormStore((s) => s.orderSide === "buy");

  const maxTradeSz = useMaxTradeSz(isBuyOrder);

  if (!isPerp) return null;

  return (
    <DetailsTile
      label="Max"
      value={formatNumber(maxTradeSz, { useFallback: true, symbol: base })}
    />
  );
};

export const Fees = () => {
  const { data } = useUserFees();

  const isPerps = useTradeContext((s) => s.instrumentType === "perps");
  const fees = isPerps
    ? { taker: data?.userCrossRate, maker: data?.userAddRate }
    : { taker: data?.userSpotCrossRate, maker: data?.userSpotAddRate };

  const taker = formatFee(fees.taker);
  const maker = formatFee(fees.maker);

  return (
    <div className="w-full flex items-center justify-between">
      <AdaptiveTooltip
        variant="underline"
        className="max-w-fit"
        title="Fees"
        trigger={<DetailsLabel>Fees</DetailsLabel>}
      >
        <p>
          Taker orders pay a {taker} fee. Maker orders pay a {maker} fee.
        </p>
      </AdaptiveTooltip>

      <DetailsValue className="space-x-1">
        <span>{formatFee(fees.taker)}</span>
        <span>/</span>
        <span>{formatFee(fees.maker)}</span>
      </DetailsValue>
    </div>
  );
};

const formatFee = (fee?: string) => {
  return formatNumber((Number(fee ?? "0") * 100) / 100, {
    style: "percent",
    useFallback: true,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
};

export const OrderSlippage = ({ size }: { size: number }) => {
  const { isBuyOrder, orderType, maxSlippage } = useShallowOrderFormStore(
    (s) => ({
      isBuyOrder: s.orderSide === "buy",
      orderType: s.settings.orderType,
      maxSlippage: s.settings.maxSlippage || DEFAULT_ORDER_MAX_SLIPPAGE,
    }),
  );
  const midPx = useTradeContext((s) => s.assetCtx.midPx);

  const slippage = useMemo(() => {
    if (orderType !== "market") return 0;

    const orderBook = useOrderBookStore.getState().getBook();

    return estimateSlippagePercent({
      orderBook,
      orderSize: size,
      midPx,
      isBuyOrder,
    });
  }, [isBuyOrder, orderType, size, midPx]);

  if (orderType !== "market") return null;

  return (
    <div className="w-full flex items-center justify-between">
      <AdaptiveTooltip
        variant="underline"
        title="Slippage"
        className="max-w-fit"
        trigger={<DetailsLabel>Slippage</DetailsLabel>}
      >
        <p>
          Average execution price compared to mid price based on current order
          book
        </p>
      </AdaptiveTooltip>

      <DetailsValue className="text-primary gap-x-1">
        <span>Est. {(slippage ?? 0).toFixed(2)}%</span>
        <span>/</span>
        <span>Max: {(maxSlippage * 100).toFixed(2)}%</span>
      </DetailsValue>
    </div>
  );
};

export const TwapDetails = ({ size }: { size: number }) => {
  const base = useTradeContext((s) => s.assetMeta.base);

  const minutes = useShallowOrderFormStore((s) => s.twapOrder.minutes);

  const sizePerSuborder = calculateSubOrderSize({
    size,
    minutes,
  });

  const numOfOrders = calculateNumberOfOrders(minutes);

  return (
    <div className="w-full space-y-2">
      <DetailsTile label="Frequency" value="30 seconds" />
      <DetailsTile
        label="Size per Suborder"
        value={formatNumber(sizePerSuborder, {
          useFallback: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          symbol: base,
        })}
      />
      <DetailsTile label="Number of Orders" value={numOfOrders || 1} />
    </div>
  );
};

type DetailsProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<"p">;

const DetailsLabel = ({ children, className, ...props }: DetailsProps) => {
  return (
    <p
      className={cn("text-3xs md:text-xs text-neutral-gray-400", className)}
      {...props}
    >
      {children}
    </p>
  );
};

const DetailsValue = ({ children, className, ...props }: DetailsProps) => {
  return (
    <p className={cn("text-3xs md:text-xs font-medium", className)} {...props}>
      {children}
    </p>
  );
};

type DetailsTileProps = {
  className?: string;
  label: React.ReactNode;
  value: React.ReactNode;
};
const DetailsTile = ({ className, label, value }: DetailsTileProps) => {
  return (
    <div className={cn("w-full flex items-center justify-between", className)}>
      <DetailsLabel>{label}</DetailsLabel>

      <DetailsValue>{value}</DetailsValue>
    </div>
  );
};
