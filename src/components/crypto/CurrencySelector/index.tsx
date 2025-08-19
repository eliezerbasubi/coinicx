"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import { ICryptoCurrency, ICurrency } from "@/types/market";

import SelectorContent from "./SelectorContent";

const SelectorDrawer = dynamic(() => import("./SelectorDrawer"));
const SelectorPopover = dynamic(() => import("./SelectorPopover"));

type Props = React.ComponentProps<typeof SelectorContent>;

const CurrencySelector = ({
  value,
  currencies,
  collisionBoundary,
  onValueChange,
}: Props) => {
  const [open, setOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const onClick = (value: ICurrency, cryptoAssetDetails?: ICryptoCurrency) => {
    onValueChange?.(value, cryptoAssetDetails);
    setOpen(false);
  };

  if (isMobile) {
    return (
      <SelectorDrawer
        open={open}
        onOpenChange={setOpen}
        trigger={<Trigger value={value} />}
      >
        <SelectorContent
          currencies={currencies}
          value={value}
          onValueChange={onClick}
          className="pt-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          contentClassName="px-4 h-[calc(100%-55px)] overflow-y-auto"
          searchClassName="px-4"
        />
      </SelectorDrawer>
    );
  }

  return (
    <SelectorPopover
      open={open}
      onOpenChange={setOpen}
      collisionBoundary={collisionBoundary}
      trigger={<Trigger value={value} />}
    >
      <SelectorContent
        currencies={currencies}
        value={value}
        onValueChange={onClick}
        contentClassName="h-60 overflow-y-auto"
      />
    </SelectorPopover>
  );
};

const Trigger = ({ value }: { value: ICurrency }) => {
  return (
    <>
      {value.assetLogo && (
        <Image
          unoptimized
          src={value.assetLogo}
          alt={value.assetName}
          width={20}
          height={20}
          className="size-5 rounded-full"
        />
      )}
      <span className="uppercase font-semibold mx-1">{value.assetCode}</span>
      <ChevronDown />
    </>
  );
};

export default CurrencySelector;
