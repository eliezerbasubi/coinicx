"use client";

import React from "react";

import { MarketType } from "@/types/market";

import MarketDetails from "./MarketDetails";
import QuoteChart from "./QuoteChart";
import TransactionForm from "./TransactionForm";

type Props = {
  type: MarketType;
};

const TransactCrypto = ({ type }: Props) => {
  return (
    <div className="w-full xl:max-w-7xl mx-auto flex justify-between flex-wrap-reverse lg:flex-nowrap gap-6 px-4 md:px-6 xl:px-0 py-6">
      <div className="w-full">
        <h1 className="text-3xl font-extrabold">
          {type === "buy" ? "Buy" : "Sell"} BTC with USD
        </h1>

        <QuoteChart />

        <MarketDetails />
      </div>

      <div className="w-full lg:mt-12">
        <TransactionForm type={type} />
      </div>
    </div>
  );
};

export default TransactCrypto;
