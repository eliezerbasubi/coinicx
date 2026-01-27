import UnderlineTooltip from "@/components/common/UnderlineTooltip";
import Visibility from "@/components/common/Visibility";
import { useUserFees } from "@/features/trade/hooks/useUserFees";
import { useTradeContext } from "@/store/trade/hooks";
import { useInstrumentStore } from "@/store/trade/instrument";
import { useMaxTradeSz } from "@/store/trade/user-trade";
import { formatNumberWithFallback } from "@/utils/formatting/numbers";

type Props = {
  isBuyOrder: boolean;
};

const OrderDetails = ({ isBuyOrder }: Props) => {
  const quote = useInstrumentStore((s) => s.assetMeta?.quote);

  const isPerp = useTradeContext((s) => s.instrumentType === "perps");

  return (
    <div className="w-full space-y-2">
      <Visibility visible={isPerp}>
        <div className="w-full flex items-center justify-between">
          <UnderlineTooltip
            className="text-xs text-neutral-gray-400"
            content="The liquidation price is the price at which your position will be liquidated if it is not closed."
          >
            <p>Liquidation Price</p>
          </UnderlineTooltip>

          <p className="text-xs font-medium">{formatNumberWithFallback(0)}</p>
        </div>
      </Visibility>
      <div className="w-full flex items-center justify-between">
        <p className="text-xs text-neutral-gray-400">Order Value</p>

        <p className="text-xs font-medium">
          {formatNumberWithFallback(0)} {quote}
        </p>
      </div>
      <Visibility visible={isPerp}>
        <div className="w-full flex items-center justify-between">
          <p className="text-xs text-neutral-gray-400">Margin</p>

          <p className="text-xs font-medium">
            {formatNumberWithFallback(0)} {quote}
          </p>
        </div>
      </Visibility>
      <MaxOrderSize isBuyOrder={isBuyOrder} />
      <Fees />
    </div>
  );
};

export default OrderDetails;

const MaxOrderSize = ({ isBuyOrder }: { isBuyOrder: boolean }) => {
  const base = useInstrumentStore((s) => s.assetMeta?.base);
  const maxTradeSz = useMaxTradeSz(isBuyOrder);

  return (
    <div className="w-full flex items-center justify-between">
      <p className="text-xs text-neutral-gray-400">Max</p>

      <p className="text-xs font-medium">
        {formatNumberWithFallback(maxTradeSz)} {base}
      </p>
    </div>
  );
};

const Fees = () => {
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
