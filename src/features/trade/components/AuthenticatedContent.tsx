import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { cn } from "@/lib/utils/cn";

const AuthenticatedContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <div
      className={cn(
        "h-full min-h-20 flex items-center justify-center",
        className,
      )}
    >
      <p className="text-sm">
        Please &nbsp;
        <span
          role="button"
          className="text-primary cursor-pointer"
          onClick={openConnectModal}
        >
          connect
        </span>
        &nbsp; your wallet first.
      </p>
    </div>
  );
};

export default AuthenticatedContent;
