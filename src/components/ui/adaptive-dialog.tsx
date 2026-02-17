import React from "react";
import dynamic from "next/dynamic";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMediaQuery } from "usehooks-ts";
import { useAccount } from "wagmi";

type Props = {
  open?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

const DrawerSheet = dynamic(() => import("./drawer-sheet"), { ssr: false });
const DialogSheet = dynamic(() => import("./dialog-sheet"), { ssr: false });

const AdaptiveDialog = (props: Props) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { connectModalOpen } = useConnectModal();
  const { isConnected } = useAccount();

  const onPointerDownOutside = (e: Event) => {
    // There were times when the modal is closed but the state remains true,
    // this was causing the modals to not close when clicked outside
    if (connectModalOpen && !isConnected) e.preventDefault();
  };

  if (!isDesktop) {
    return (
      <DrawerSheet {...props} onPointerDownOutside={onPointerDownOutside} />
    );
  }

  return <DialogSheet {...props} onPointerDownOutside={onPointerDownOutside} />;
};

export default AdaptiveDialog;
