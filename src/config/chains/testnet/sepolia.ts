import { sepolia } from "viem/chains";

import { IChain } from "@/types/chain";

const chainConfig: IChain = {
  ...sepolia,
  iconPath: "",
  contracts: {
    permit2: { address: "0x" },
  },
};

export default chainConfig;
