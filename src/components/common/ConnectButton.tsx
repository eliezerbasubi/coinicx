import React, { forwardRef } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const ConnectButton = forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<React.ComponentProps<typeof Button>> & {
    disconnectedLabel?: string;
  }
>(({ disconnectedLabel, ...props }, ref) => {
  const { isConnecting, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const getLabel = () => {
    if (isConnecting) {
      return "Connecting";
    }
    if (!isConnected) {
      return disconnectedLabel || "Connect wallet";
    }
    return props.children || props.label;
  };

  const label = getLabel();

  return (
    <Button
      suppressHydrationWarning
      {...props}
      ref={ref}
      className={cn("flex justify-center items-center gap-2", props.className)}
      disabled={isConnected && (props.disabled || isConnecting)}
      onClick={(event) => {
        if (!isConnected) {
          event.preventDefault();
          disconnect();
          openConnectModal?.();
          return;
        }
        props.onClick?.(event);
      }}
    >
      {label}
    </Button>
  );
});

ConnectButton.displayName = "ConnectButton";

export default ConnectButton;
