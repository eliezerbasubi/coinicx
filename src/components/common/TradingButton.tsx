import React, { useState } from "react";

import { useApproveBuilderFee } from "@/hooks/useApproveBuilderFee";
import { useEnableTrading } from "@/hooks/useEnableTrading";

import ConnectButton from "./ConnectButton";
import EnableTradingModal from "./EnableTradingModal";

type Props = React.ComponentProps<typeof ConnectButton>;

const TradingButton = (props: Props) => {
  const { isEnableTradingRequired } = useEnableTrading();
  const { hasApprovedBuilderFee } = useApproveBuilderFee();

  const [open, setOpen] = useState(false);

  const requiresApproval = !hasApprovedBuilderFee || isEnableTradingRequired;

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (requiresApproval) {
      setOpen(true);
      return;
    }

    return props.onClick?.(e);
  };

  const label = requiresApproval
    ? "Enable Trading"
    : props.label || props.children;

  return (
    <>
      <ConnectButton
        {...props}
        disabled={props.disabled && !requiresApproval}
        loading={props.loading}
        label={label}
        onClick={onClick}
      />
      <EnableTradingModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default TradingButton;
