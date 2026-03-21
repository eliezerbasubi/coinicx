import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";

import SettingsTrigger from "./components/SettingsTrigger";
import SwapForm from "./components/SwapForm";

const Swap = () => {
  return (
    <div
      id="swap-container"
      className="w-full max-w-116.25 mx-auto px-4 md:px-2 md:pb-4 pt-6 standalone:pt-safe-top md:pt-12"
    >
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <Link href={ROUTES.root} className="block md:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-base md:text-xl text-white font-semibold md:font-bold text-center flex-1 md:flex-0">
          Swap
        </h1>
        <SettingsTrigger />
      </div>

      <SwapForm />
    </div>
  );
};

export default Swap;
