"use client";

import { formatNumber } from "@/lib/utils/formatting/numbers";
import Visibility from "@/components/common/Visibility";
import { Skeleton } from "@/components/ui/skeleton";
import Tag from "@/components/ui/tag";

import { usePortfolioData } from "../hooks/usePortfolioData";

const formatFee = (rate: string | undefined) => {
  return formatNumber(Number(rate || "0"), {
    style: "percent",
    useFallback: true,
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  });
};

const PortfolioFees = () => {
  const { data, isLoading } = usePortfolioData();
  const fees = data?.fees;
  const volume14d = data?.volume14d ?? 0;

  return (
    <div className="w-full bg-neutral-gray-200/50 rounded-md p-4">
      <div className="flex items-center flex-wrap gap-x-6 gap-y-4 divide-y md:divide-x divide-neutral-gray-200">
        {/* 14-Day Volume */}
        <div className="w-full md:w-fit space-y-2 shrink-0 pb-4 md:pb-0 md:pr-4 md:border-b-0">
          <p className="text-xs text-neutral-gray-400">14 Day Volume</p>

          <Visibility
            visible={!isLoading}
            fallback={<Skeleton className="w-24 h-4" />}
          >
            <p
              suppressHydrationWarning
              className="text-sm font-semibold text-white"
            >
              {formatNumber(volume14d, {
                style: "currency",
                notation: "compact",
                maximumFractionDigits: 1,
              })}
            </p>
          </Visibility>
        </div>

        <div className="flex-1 flex items-center gap-x-6 md:gap-x-10">
          {/* Perps fees */}
          <FeeBlock
            label="Perps"
            takerFee={fees?.userCrossRate || "0"}
            makerFee={fees?.userAddRate || "0"}
          />

          {/* Spot fees */}
          <FeeBlock
            label="Spot"
            takerFee={fees?.userSpotCrossRate || "0"}
            makerFee={fees?.userSpotAddRate || "0"}
          />
        </div>
      </div>
    </div>
  );
};

type FeeBlockProps = {
  label: string;
  takerFee: string;
  makerFee: string;
};

const FeeBlock = ({ label, takerFee, makerFee }: FeeBlockProps) => (
  <div className="space-y-1">
    <Tag value={label} className="text-neutral-gray-100 bg-neutral-gray-200" />

    <div className="flex items-center flex-wrap gap-1 text-xs">
      <p className="text-neutral-gray-400">Taker fee / Maker fee</p>
      <p className="text-white font-medium space-x-1">
        <span>{formatFee(takerFee)}</span>
        <span>/</span>
        <span>{formatFee(makerFee)}</span>
      </p>
    </div>
  </div>
);

export default PortfolioFees;
