import { useAccountModal } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";
import { useAccount } from "wagmi";

import { useAccountTransactStore } from "@/lib/store/trade/account-transact";
import { formatAddress } from "@/lib/utils/formatting/formatAddress";
import { Button } from "@/components/ui/button";

import ConnectButton from "./ConnectButton";

const AccountButton = () => {
  const { openAccountModal } = useAccountModal();
  const { isConnected, address } = useAccount();

  if (!isConnected || !address) {
    return (
      <ConnectButton
        size="sm"
        showConnecting={false}
        disconnectedLabel="Connect"
        className="w-17 md:w-24 h-7 md:h-8 gap-0 px-0 text-xs md:text-sm"
      />
    );
  }

  return (
    <div className="flex items-center gap-x-4">
      <Button
        label="Deposit"
        className="w-24 md:w-fit gap-x-1 h-7 md:h-8"
        onClick={() =>
          useAccountTransactStore.getState().openAccountTransact("deposit")
        }
      />
      <Button
        variant="outline"
        onClick={openAccountModal}
        className="w-24 md:w-fit gap-x-1 h-7 md:h-8"
      >
        <p className="text-xs md:text-sm">{formatAddress(address, 4)}</p>
        <ChevronDown />
      </Button>
    </div>
  );
};

export default AccountButton;
