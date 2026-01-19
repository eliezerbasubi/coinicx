"use client";

import React, { useState } from "react";
import Image from "next/image";

import { InstrumentType } from "@/types/trade";
import { cn } from "@/utils/cn";

type Props = {
  name: string;
  className?: string;
  instrumentType: InstrumentType;
};

const TokenImage = ({ name, className, instrumentType }: Props) => {
  const [error, setError] = useState(false);

  const imagePath =
    instrumentType === "spot" ? name + "_spot.svg" : name + ".svg";

  return (
    <div className={cn("size-8 rounded-full overflow-hidden", className)}>
      {(!error && name && (
        <Image
          src={`https://app.hyperliquid.xyz/coins/${imagePath}`}
          alt={name}
          width={100}
          height={100}
          className="size-full rounded-full"
          onError={() => setError(true)}
        />
      )) || (
        <div className="bg-primary text-primary-dark size-full grid place-content-center font-semibold">
          <span>{name.charAt(0)}</span>
        </div>
      )}
    </div>
  );
};

export default TokenImage;
