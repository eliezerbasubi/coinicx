import { Config, createConfig, CreateConfigParameters, http } from "wagmi";

import { CHAINS_CONFIG_ENV } from "./chains";
import { connectors } from "./connectors";

const supportedChains = Object.values(CHAINS_CONFIG_ENV) as unknown as CreateConfigParameters["chains"];

export const wagmiConfig: Config = createConfig({
  chains: supportedChains,
  connectors,
  ssr: true,
  transports: supportedChains.reduce(
    (obj, chain) => ({ ...obj, [chain.id]: http() }),
    {},
  ),
});
