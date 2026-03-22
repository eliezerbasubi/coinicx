import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const AuthenticatedContent = ({ children }: { children: React.ReactNode }) => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  if (address) {
    return children;
  }

  return (
    <div className="h-full min-h-20 flex items-center justify-center">
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
