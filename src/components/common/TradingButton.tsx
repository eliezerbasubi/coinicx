import React from "react";

import { useEnsureTradingEnabled } from "@/features/trade/hooks/useEnsureTradingEnabled";

import ConnectButton from "./ConnectButton";

type Props = React.ComponentProps<typeof ConnectButton>;

const toastId = "enable-trading";

const TradingButton = (props: Props) => {
  const { shouldEnableTrading, processing, approveFeeAndEnableTrading } =
    useEnsureTradingEnabled({ toastId });

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (shouldEnableTrading) {
      return approveFeeAndEnableTrading();
    }
    return props.onClick?.(e);
  };

  const label = shouldEnableTrading
    ? "Enable Trading"
    : props.label || props.children;

  return (
    <ConnectButton
      {...props}
      disabled={processing || (props.disabled && !shouldEnableTrading)}
      loading={processing || props.loading}
      label={label}
      onClick={onClick}
    />
  );
};

export default TradingButton;
