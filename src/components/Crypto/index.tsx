"use client";

import React from "react";

import MarketDetails from "./MarketDetails";
import QuoteChart from "./QuoteChart";
import TransactionForm from "./TransactionForm";

const TransactCrypto = () => {
  return (
    <div className="w-full xl:max-w-7xl mx-auto flex justify-between flex-wrap-reverse lg:flex-nowrap gap-6 px-4 md:px-6 xl:px-0 py-6">
      <div className="w-full">
        {/* <h1 className="text-3xl font-extrabold">{title}</h1> */}

        <QuoteChart />

        <MarketDetails />
      </div>

      <div className="w-full mb-12 lg:mb-0 lg:mt-12">
        <TransactionForm />
      </div>
    </div>
  );
};

export default TransactCrypto;
