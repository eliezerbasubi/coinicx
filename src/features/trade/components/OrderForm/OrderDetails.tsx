import { useMemo } from "react";

import { useTradeContext } from "@/lib/store/trade/hooks";
import { useShallowInstrumentStore } from "@/lib/store/trade/instrument";
import { useShallowOrderFormStore } from "@/lib/store/trade/order-form";
import { useOrderBookStore } from "@/lib/store/trade/orderbook";
import { useMaxTradeSz, useUserTradeStore } from "@/lib/store/trade/user-trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import AdaptiveTooltip from "@/components/ui/adaptive-tooltip";
import { DEFAULT_ORDER_MAX_SLIPPAGE } from "@/features/trade/constants";
import { useAssetMetas } from "@/features/trade/hooks/useAssetMetas";
import { useUserFees } from "@/features/trade/hooks/useUserFees";
import {
  estimateLiquidationPrice,
  estimateSlippagePercent,
} from "@/features/trade/utils";
import {
  calculateNumberOfOrders,
  calculateSubOrderSize,
} from "@/features/trade/utils/twap";

export const LiquidationPrice = ({ size }: { size: number }) => {
  const { isPerps, coin, decimals } = useTradeContext((s) => ({
    isPerps: s.instrumentType === "perps",
    coin: s.coin,
    decimals: s.decimals ?? 10,
  }));

  const { perpMetas } = useAssetMetas();

  const { assetMeta, assetCtx } = useShallowInstrumentStore((s) => ({
    assetMeta: s.assetMeta,
    assetCtx: s.assetCtx,
  }));

  const { limitPrice, isBuyOrder, maxSlippage, reduceOnly, orderType } =
    useShallowOrderFormStore((s) => ({
      limitPrice: s.limitPrice,
      isBuyOrder: s.orderSide === "buy",
      maxSlippage: s.settings.maxSlippage || DEFAULT_ORDER_MAX_SLIPPAGE,
      reduceOnly: s.settings.reduceOnly,
      orderType: s.settings.orderType,
    }));

  const liquidationPrice = useMemo(() => {
    const leverage = useUserTradeStore.getState().leverage;

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

    return estimateLiquidationPrice({
      leverage,
      assetName: coin,
      entryPrice: limitPrice ? parseFloat(limitPrice) : assetCtx?.markPx || 0,
      midPx: assetCtx?.midPx || 0,
      maxLeverage: perpAssetMeta.maxLeverage,
      orderSize: size,
      clearinghouseState: useUserTradeStore.getState().clearinghouseState,
      isBuyOrder,
    });
  }, [
    size,
    limitPrice,
    assetCtx?.markPx,
    isPerps,
    coin,
    assetMeta?.perpDexIndex,
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
      >
        <p>
          The liquidation price is the price at which your position will be
          liquidated if it is not closed.
        </p>
      </AdaptiveTooltip>

      <DetailsValue>
        {formatNumber(liquidationPrice || 0, {
          style: "currency",
          useFallback: true,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
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
  const quote = useShallowInstrumentStore((s) => s.assetMeta?.quote);
  const isPerp = useTradeContext((s) => s.instrumentType === "perps");
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
  const base = useShallowInstrumentStore((s) => s.assetMeta?.base);
  const isBuyOrder = useShallowOrderFormStore((s) => s.orderSide === "buy");
  const isPerps = useTradeContext((s) => s.instrumentType === "perps");

  const maxTradeSz = useMaxTradeSz(isBuyOrder);

  if (!isPerps) return null;

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
  const midPx = useShallowInstrumentStore((s) => s.assetCtx?.midPx || 0);

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
  const base = useTradeContext((s) => s.base);

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

type DetailsProps = { children: React.ReactNode; className?: string };

const DetailsLabel = ({ children, className }: DetailsProps) => {
  return (
    <p className={cn("text-3xs md:text-xs text-neutral-gray-400", className)}>
      {children}
    </p>
  );
};

const DetailsValue = ({ children, className }: DetailsProps) => {
  return (
    <p className={cn("text-3xs md:text-xs font-medium", className)}>
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
