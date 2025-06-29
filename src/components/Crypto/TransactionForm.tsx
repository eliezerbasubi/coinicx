import React, { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";

import { MarketType } from "@/types/market";
import { ROUTES } from "@/constants/routes";
import { getCryptoCurrencies, getFiatCurrencies } from "@/services/markets";
import { cn } from "@/utils/cn";

import { Button } from "../ui/button";
import TokenInput from "./TokenInput";

const CurrencySelector = dynamic(() => import("./CurrencySelector"));

type Props = {
  type: MarketType;
};

const TransactionForm = ({ type }: Props) => {
  const inputsContainerRef = useRef<HTMLDivElement | null>(null);

  const { cryptoList, fiatList, isLoading } = useQueries({
    queries: [
      {
        queryKey: ["cryptoList"],
        queryFn: () => getCryptoCurrencies(),
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["fiatList"],
        queryFn: () => getFiatCurrencies(),
        refetchOnWindowFocus: false,
      },
    ],
    combine(result) {
      return {
        cryptoList: result[0].data,
        fiatList: result[1].data,
        isLoading:
          result[0].status === "pending" || result[1].status === "pending",
      };
    },
  });

  return (
    <div className="w-full max-w-md mx-auto border border-neutral-gray-200 rounded-2xl overflow-hidden">
      <nav className="w-full h-16 flex items-center">
        <NavItem isCurrent={type === "buy"} type="buy" label="Buy" />
        <NavItem isCurrent={type === "sell"} type="sell" label="Sell" />
      </nav>

      <div className="bg-primary-dark rounded-2xl overflow-hidden">
        <div ref={inputsContainerRef} className="p-6 space-y-4">
          <TokenInput
            label="Spend"
            name="tokenIn"
            placeholder="Enter Amount"
            // trailing={
            //   isLoading ? (
            //     <p>loading...</p>
            //   ) : (
            //     cryptoList && (
            //       <CurrencySelector
            //         value={cryptoList[0]}
            //         currencies={cryptoList}
            //         collisionBoundary={inputsContainerRef.current}
            //       />
            //     )
            //   )
            // }
          />
          <TokenInput
            label="Receive"
            name="tokenOut"
            placeholder="0"
            // trailing={
            //   isLoading ? (
            //     <p>loading...</p>
            //   ) : (
            //     fiatList && (
            //       <CurrencySelector
            //         value={fiatList[0]}
            //         currencies={fiatList}
            //         collisionBoundary={inputsContainerRef.current}
            //       />
            //     )
            //   )
            // }
          />
        </div>
        <div className="p-6 mt-32">
          <Button size="lg" className="font-bold text-xl">
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({
  isCurrent,
  label,
  type,
}: {
  isCurrent: boolean;
  label: string;
  type: MarketType;
}) => {
  return (
    <Link
      href={type === "sell" ? ROUTES.crypto.sell : ROUTES.crypto.buy}
      className="w-full h-full"
    >
      <div
        className={cn(
          "w-full h-full flex justify-center items-center font-extrabold text-neutral-gray-300 bg-neutral-gray-200 rounded-bl-2xl",
          {
            "bg-primary-dark text-white": isCurrent,
            "rounded-bl-none rounded-br-2xl": !isCurrent && type === "buy",
          },
        )}
      >
        <p>{label}</p>
      </div>
    </Link>
  );
};

export default TransactionForm;
