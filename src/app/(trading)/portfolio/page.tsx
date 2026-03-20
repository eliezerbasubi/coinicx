import { Metadata } from "next";

import Portfolio from "@/features/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Manage your Hyperliquid portfolio. View your open positions, orders, balances, transactions, and more.",
};

const PortfolioPage = () => {
  return <Portfolio />;
};

export default PortfolioPage;
