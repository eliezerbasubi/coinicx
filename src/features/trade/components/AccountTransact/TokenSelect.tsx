import { useState } from "react";
import { ChevronDown } from "lucide-react";

import AdaptivePopover from "@/components/ui/adaptive-popover";
import { formatNumber } from "@/utils/formatting/numbers";

import TokenImage from "../TokenImage";

type Token = {
  name: string;
  symbol: string;
  network: string;
  balance?: string;
  balanceNtl?: string;
};

interface Props {
  token: Token;
  tokens: Token[];
  showBalance?: boolean;
  onTokenChange: (value: Token) => void;
}

const TokenSelect = ({ token, tokens, showBalance, onTokenChange }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <AdaptivePopover
      modal
      open={open}
      onOpenChange={setOpen}
      className="w-full md:w-87.5 px-4 pb-5 md:p-0 overflow-hidden"
      trigger={
        <div className="w-full h-11 flex items-center justify-between gap-x-2 px-3 py-2 mb-2 border border-neutral-gray-200 text-neutral-gray-100 rounded-md cursor-pointer">
          <TokenImage
            key={token.name}
            instrumentType="spot"
            name={token.symbol}
            className="size-5"
          />
          <p className="flex-1 font-medium capitalize">{token.symbol}</p>
          <ChevronDown className="size-4 opacity-50" />
        </div>
      }
    >
      <div className="w-full max-h-44 overflow-y-auto">
        {tokens.map((token) => (
          <div
            role="button"
            tabIndex={0}
            key={token.name}
            className="w-full flex items-center gap-2 py-1.5 md:px-3 cursor-pointer hover:bg-neutral-gray-600"
            onClick={() => {
              onTokenChange(token);
              setOpen(false);
            }}
          >
            <TokenImage
              name={token.symbol}
              instrumentType="spot"
              className="size-8"
            />
            <div className="flex-1">
              <p className="text-neutral-gray-100 text-xs font-medium capitalize">
                {token.symbol}
              </p>
              <p className="text-neutral-gray-400 text-xs capitalize">
                {token.network}
              </p>
            </div>
            {showBalance && (
              <div className="text-right">
                <p className="text-xs font-medium text-white">
                  {token.balance}
                </p>
                <p className="text-xs font-medium text-neutral-gray-400">
                  {formatNumber(Number(token.balanceNtl), {
                    style: "currency",
                  })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdaptivePopover>
  );
};

export default TokenSelect;
