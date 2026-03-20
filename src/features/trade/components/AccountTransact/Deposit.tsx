"use client";

import { useState } from "react";
import { AlertTriangleIcon, CheckIcon, CopyIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatting/numbers";
import ConnectButton from "@/components/common/ConnectButton";
import FormInputControl from "@/components/common/FormInputControl";
import Visibility from "@/components/common/Visibility";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useDeposit } from "./hooks/useDeposit";
import TokenSelect from "./TokenSelect";

const Deposit = () => {
  const {
    currentAssetInfo,
    currentNetworkInfo,
    deposit,
    depositAddress,
    disabled,
    dispatch,
    generateStatus,
    isConnected,
    label,
    minDepositAmount,
    tokenBalance,
    unitFees,
    state,
    tokens,
  } = useDeposit();

  return (
    <div className="space-y-2">
      <TokenSelect
        token={currentAssetInfo}
        tokens={tokens}
        onTokenChange={(token) => dispatch({ token: token.symbol })}
      />

      <Visibility visible={currentAssetInfo.network === "arbitrum"}>
        <FormInputControl
          value={state.amount}
          max={Number(tokenBalance || "0")}
          onValueChange={(amount) => dispatch({ amount })}
          placeholder="0.00"
          label="Amount"
          trailing={
            <span
              className={cn("text-sm text-neutral-gray-400 font-medium", {
                "text-white": !!state.amount,
              })}
            >
              {currentAssetInfo.symbol}
            </span>
          }
        />
      </Visibility>

      <Visibility visible={currentAssetInfo.network !== "arbitrum"}>
        <div className="space-y-1 flex flex-col justify-center items-center mb-1">
          <Visibility
            visible={!!depositAddress}
            fallback={<Skeleton className="size-35" />}
          >
            <div className="size-35 rounded-xl bg-white border border-gray-100 shadow-xs p-3">
              <QRCodeSVG
                value={depositAddress}
                className="size-full"
                imageSettings={{
                  src: currentAssetInfo.assetUrl,
                  excavate: true,
                  width: 40,
                  height: 40,
                }}
              />
            </div>
          </Visibility>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-gray-400 font-medium">
              Deposit Address
            </label>
            <div className="flex items-center gap-2 bg-neutral-gray-200 rounded-md p-3">
              <Visibility visible={!!depositAddress}>
                <span className="flex-1 text-xs text-white font-mono break-all">
                  {depositAddress}
                </span>

                <CopyButton content={depositAddress} />
              </Visibility>

              <Visibility visible={!isConnected}>
                <p className="text-neutral-gray-400 text-xs">
                  Connect your wallet to generate a deposit address.
                </p>
              </Visibility>

              <Visibility visible={generateStatus === "error"}>
                <p className="text-red-500 text-xs">
                  Failed to generate deposit address. Please try again.
                </p>
              </Visibility>
            </div>
          </div>
        </div>
      </Visibility>

      <div className="w-full space-y-1 bg-neutral-gray-200 p-2 rounded-lg mb-1">
        <Visibility visible={currentAssetInfo.network === "arbitrum"}>
          <InfoTile
            label="Available Balance"
            value={formatNumber(Number(tokenBalance || "0"), {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
              symbol: currentAssetInfo.symbol,
            })}
          />
        </Visibility>
        <InfoTile
          label="Minimum deposit"
          value={`${minDepositAmount} ${currentAssetInfo.symbol}`}
        />
        <InfoTile
          label="Estimated time"
          value={
            unitFees?.depositEta ?? currentNetworkInfo.depositEta ?? "Instant"
          }
        />
        <InfoTile
          label="Network fee"
          value={`${unitFees?.depositFee ? unitFees.depositFee + " " + currentAssetInfo.symbol : "Free"}`}
        />
      </div>

      <Visibility visible={currentAssetInfo.network !== "arbitrum"}>
        <div className="flex items-start gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 rounded-md p-2">
          <AlertTriangleIcon className="size-3.5 shrink-0 mt-0.5" />
          <p className="flex-1 space-x-0.5 break-all">
            <span>Depositing less than the minimum amount of</span>
            <span className="font-medium">
              {minDepositAmount}&nbsp;
              {currentAssetInfo.symbol}
            </span>
            <span>will result in loss of funds.</span>
          </p>
        </div>
      </Visibility>

      <ConnectButton
        label={currentAssetInfo.network === "arbitrum" ? label : "Done"}
        loading={state.processing}
        disabled={currentAssetInfo.network === "arbitrum" && disabled}
        onClick={deposit}
        className="w-full mt-2"
      />
    </div>
  );
};

const InfoTile = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center">
    <p className="text-xs text-neutral-gray-400">{label}</p>
    <p className="text-xs text-white font-medium">{value}</p>
  </div>
);

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="size-fit p-0 has-[>svg]:px-0 shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <CheckIcon className="size-4 text-buy" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  );
};

export default Deposit;
