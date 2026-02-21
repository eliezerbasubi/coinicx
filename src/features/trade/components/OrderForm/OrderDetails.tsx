import { useMemo } from "react";

import UnderlineTooltip from "@/components/common/UnderlineTooltip";
import Visibility from "@/components/common/Visibility";
import { DEFAULT_ORDER_MAX_SLIPPAGE } from "@/features/trade/constants";
import { useMetaAndAssetCtxs } from "@/features/trade/hooks/useMetaAndAssetCtxs";
import { useUserFees } from "@/features/trade/hooks/useUserFees";
import {
  estimateLiquidationPrice,
  estimateSlippagePercent,
} from "@/features/trade/utils";
import { useTradeContext } from "@/store/trade/hooks";
import { useShallowInstrumentStore } from "@/store/trade/instrument";
import { useShallowOrderFormStore } from "@/store/trade/order-form";
import { useOrderBookStore } from "@/store/trade/orderbook";
import { useMaxTradeSz, useUserTradeStore } from "@/store/trade/user-trade";
import { formatNumberWithFallback } from "@/utils/formatting/numbers";

export const LiquidationPrice = ({ size }: { size: number }) => {
  const isPerp = useTradeContext((s) => s.instrumentType === "perps");
  const coin = useTradeContext((s) => s.coin);
  const { data } = useMetaAndAssetCtxs();

  const assetMeta = useShallowInstrumentStore((s) => s.assetMeta);
  const assetCtx = useShallowInstrumentStore((s) => s.assetCtx);
  const decimals = useTradeContext((s) => s.decimals ?? 10);

  const { limitPrice, isBuyOrder, maxSlippage, reduceOnly } =
    useShallowOrderFormStore((s) => ({
      limitPrice: s.limitPrice,
      isBuyOrder: s.orderSide === "buy",
      maxSlippage: s.settings.maxSlippage || DEFAULT_ORDER_MAX_SLIPPAGE,
      reduceOnly: s.settings.reduceOnly,
    }));

  const liquidationPrice = useMemo(() => {
    const leverage = useUserTradeStore.getState().leverage;

    if (
      !isPerp ||
      !leverage ||
      !data.perpMetas ||
      assetMeta?.perpDexIndex === undefined ||
      reduceOnly
    )
      return 0;

    const perpDexState = data.perpMetas[assetMeta.perpDexIndex];
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
    isPerp,
    coin,
    assetMeta?.perpDexIndex,
    data.perpMetas,
    reduceOnly,
    maxSlippage,
    isBuyOrder,
  ]);

  if (!isPerp) return null;

  return (
    <div className="w-full flex items-center justify-between">
      <UnderlineTooltip
        className="text-xs text-neutral-gray-400"
        content="The liquidation price is the price at which your position will be liquidated if it is not closed."
      >
        <p>Liquidation Price</p>
      </UnderlineTooltip>

      <p className="text-xs font-medium">
        {formatNumberWithFallback(liquidationPrice || 0, {
          style: "currency",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}{" "}
      </p>
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

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">Order Value</p>

        <p className="text-xs font-medium">
          {formatNumberWithFallback(data.orderValue, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {quote}
        </p>
      </div>
      <Visibility visible={isPerp}>
        <div className="w-full flex items-center justify-between">
          <p className="text-xs text-neutral-gray-400">Margin</p>

          <p className="text-xs font-medium">
            {formatNumberWithFallback(data.marginRequired, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {quote}
          </p>
        </div>
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
    <div className="w-full flex items-center justify-between">
      <p className="text-xs text-neutral-gray-400">Max</p>

      <p className="text-xs font-medium">
        {formatNumberWithFallback(maxTradeSz)} {base}
      </p>
    </div>
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
      <UnderlineTooltip
        className="text-xs text-neutral-gray-400"
        content={`Taker orders pay a ${taker} fee. Maker orders pay a ${maker} fee.`}
        contentClassName="max-w-fit"
      >
        <p>Fees</p>
      </UnderlineTooltip>

      <p className="text-xs font-medium space-x-1">
        <span>{formatFee(fees.taker)}</span>
        <span>/</span>
        <span>{formatFee(fees.maker)}</span>
      </p>
    </div>
  );
};

const formatFee = (fee?: string) => {
  return formatNumberWithFallback((Number(fee ?? "0") * 100) / 100, {
    style: "percent",
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
      <UnderlineTooltip
        className="text-xs text-neutral-gray-400"
        content="Average execution price compared to mid price based on current order book"
        contentClassName="max-w-fit"
      >
        <p>Slippage</p>
      </UnderlineTooltip>

      <p className="text-xs text-primary font-medium space-x-1">
        <span>Est. {(slippage ?? 0).toFixed(4)}%</span>
        <span>/</span>
        <span>Max: {(maxSlippage * 100).toFixed(2)}%</span>
      </p>
    </div>
  );
};
