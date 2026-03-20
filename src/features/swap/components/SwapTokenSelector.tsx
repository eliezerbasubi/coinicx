import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { SwapSpotToken } from "@/lib/types/swap";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import AdaptiveDialog from "@/components/ui/adaptive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import TokenImage from "@/features/trade/components/TokenImage";

import { SWAP_POPULAR_TOKENS } from "../constants";
import { useSwapTokens } from "../hooks/useSwapTokens";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (asset: SwapSpotToken) => void;
};

const SwapTokenSelector = ({ open, onOpenChange, onSelect }: Props) => {
  const { tokens, status } = useSwapTokens();

  const [search, setSearch] = useState("");

  const filteredAssets = useMemo(() => {
    if (!tokens) return [];
    if (!search) return tokens;

    return tokens.filter(
      (ast) =>
        ast.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
        ast.fullName?.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    );
  }, [search, tokens]);

  const onSelectAsset = (asset: SwapSpotToken) => {
    onSelect?.(asset);
    setSearch("");
    onOpenChange?.(false);
  };

  return (
    <AdaptiveDialog
      open={open}
      title={<p className="md:pl-3 md:pt-2">Select a token</p>}
      onOpenChange={onOpenChange}
      className="h-auto md:max-h-auto flex flex-col gap-y-0 px-4 pb-4 md:p-2 md:pb-0 standalone:pb-0"
    >
      <div className="w-full md:px-2 md:pt-3">
        <div className="flex items-center h-9 px-3 md:px-4 mb-1 md:mb-2 rounded-lg border border-neutral-gray-200 hover:border-neutral-gray-400">
          <Search className="text-gray-600 size-5" />
          <input
            type="search"
            name="search"
            id="search"
            placeholder="Search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoFocus={false}
            className="w-full h-full outline-0 appearance-none pl-4 text-white placeholder:text-neutral-gray-400"
            value={search}
            onChange={({ target: { value } }) => setSearch(value)}
          />
        </div>
      </div>

      <div className="w-full overflow-y-auto">
        <div className="min-h-96 md:max-h-96">
          {status === "pending" && !filteredAssets.length && (
            <>
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-x-3 md:px-2 py-1"
                >
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="w-full mb-1 sticky top-0 bg-background pb-2 md:px-2">
            <p className="text-neutral-gray-400 text-xs font-medium mb-1">
              Popular Tokens
            </p>
            <div className="flex items-center flex-wrap gap-1">
              {SWAP_POPULAR_TOKENS.map((token) => (
                <div
                  key={token}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const asset = tokens.find((ast) => ast.name === token);
                    if (!asset) return;
                    onSelectAsset(asset);
                  }}
                  className="flex items-center gap-x-1 bg-neutral-gray-200 hover:bg-neutral-gray-600 rounded-2xl cursor-pointer p-1 pr-2"
                >
                  <TokenImage
                    key={token}
                    name={token}
                    instrumentType="spot"
                    className="size-5"
                  />
                  <p className="text-white text-xs font-medium">{token}</p>
                </div>
              ))}
            </div>
          </div>

          {filteredAssets.slice(0, 30).map((asset) => {
            return (
              <div
                key={asset.name}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between gap-x-3 md:px-2 py-1 rounded-lg cursor-pointer hover:bg-neutral-gray-600"
                onClick={() => onSelectAsset(asset)}
              >
                <TokenImage
                  key={asset.name}
                  name={asset.name}
                  instrumentType="spot"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">
                    {asset.fullName || asset.name}
                  </p>
                  <p className="text-neutral-gray-400 text-xs font-medium">
                    {asset.name}
                  </p>
                </div>
                {asset.balance && asset.balance !== "0" && (
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">
                      {formatNumber(
                        Number(asset.balanceNtl) || Number(asset.balance),
                        {
                          style: "currency",
                        },
                      )}
                    </p>
                    <p className="text-neutral-gray-400 text-xs font-medium">
                      {formatNumber(Number(asset.balance), {
                        maximumFractionDigits: 10,
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!filteredAssets.length && search && (
          <div className="w-full min-h-96 text-center text-neutral-gray-400">
            <p>
              No results found for{" "}
              <span className="text-white font-medium">{search}</span>
            </p>
          </div>
        )}
      </div>
    </AdaptiveDialog>
  );
};

export default React.memo(SwapTokenSelector);
