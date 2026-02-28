"use client";

import { useState } from "react";
import Image from "next/image";

import { InstrumentType } from "@/types/trade";
import { cn } from "@/utils/cn";

type Props = {
  name: string;
  coin?: string;
  className?: string;
  instrumentType: InstrumentType;
};

const TokenImage = ({ name, coin, className, instrumentType }: Props) => {
  const [error, setError] = useState(false);

  const isSpot = instrumentType === "spot";
  const tokenName = isSpot ? name : (coin ?? name);

  const imagePath = isSpot ? tokenName + "_spot.svg" : tokenName + ".svg";

  return (
    <div className={cn("size-8 rounded-full overflow-hidden", className)}>
      {(!error && tokenName && (
        <Image
          src={`https://app.hyperliquid.xyz/coins/${imagePath}`}
          alt={tokenName}
          width={100}
          height={100}
          className="size-full rounded-full"
          onError={() => setError(true)}
        />
      )) || (
        <div className="bg-primary text-primary-dark size-full grid place-content-center font-semibold">
          <span>{tokenName.charAt(0)}</span>
        </div>
      )}
    </div>
  );
};

export default TokenImage;
