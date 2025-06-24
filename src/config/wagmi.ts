import { Config, createConfig, CreateConfigParameters, http } from "wagmi";

import { CHAINS_CONFIG } from "./chains";
import { connectors } from "./connectors";

export const wagmiConfig: Config = createConfig({
  chains: CHAINS_CONFIG as unknown as CreateConfigParameters["chains"],
  connectors,
  ssr: true,
  transports: CHAINS_CONFIG.reduce(
    (obj, chain) => ({ ...obj, [chain.id]: http() }),
    {},
  ),
});
