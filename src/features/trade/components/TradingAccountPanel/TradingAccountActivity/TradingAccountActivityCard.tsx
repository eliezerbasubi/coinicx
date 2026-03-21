import { AccountActivity } from "@/lib/types/trade";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import Tag from "@/components/ui/tag";

import CardItem from "../CardItem";

type Props = {
  data: AccountActivity;
};

const TradingAccountActivityCard = ({ data }: Props) => {
  const multiplier = data.isIncoming ? 1 : -1;

  return (
    <div className="w-full p-3 bg-neutral-gray-600 rounded-lg">
      <div className="flex items-center justify-between gap-x-4 mb-1">
        <div className="flex items-center gap-x-1">
          <p className="mr-1 line-clamp-1 text-xs font-medium">{data.action}</p>
          <Tag
            value={data.status}
            className="text-neutral-gray-400 bg-neutral-gray-200 capitalize font-medium line-clamp-1"
          />
        </div>
        <span className="text-3xs md:text-sm text-neutral-gray-400 font-medium">
          {new Date(data.timestamp).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 text-sm">
        <CardItem
          label="Account Change"
          value={
            <span
              className={cn("text-sell space-x-1", {
                "text-buy": data.isIncoming,
              })}
            >
              <span>
                {formatNumber(data.accountChange * multiplier, {
                  maximumFractionDigits: 6,
                })}
              </span>
              <span>{data.asset}</span>
            </span>
          }
        />
        <CardItem
          label="Fee"
          value={
            <span
              className={cn("text-white space-x-1", {
                "text-sell": !!data.fee,
              })}
            >
              <span>
                {formatNumber(data.fee, {
                  useFallback: true,
                  maximumSignificantDigits: 6,
                })}
              </span>
              <span>{!!data.fee && data.feeToken}</span>
            </span>
          }
        />
      </div>
    </div>
  );
};

export default TradingAccountActivityCard;
