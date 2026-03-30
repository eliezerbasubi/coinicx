export const COINICX_BUILDER_SETTINGS = {
  b: "0xCf7e559aDA0E979BbbFF1B263Ea60185a9A594e4",
  perps: 40,
  spot: 20,
} as const;

export const COINICX_AGENT_SETTINGS = {
  agentName: "CoinicX",
  agentAddress: "0x7344fe7714C7a16314ea35DdB1004C7574347D6E",
  // This wallet does not and should not hold funds, it's just for signing messages
  // on behalf of the user
  pk: process.env.NEXT_PUBLIC_AGENT_PK as `0x${string}`,
} as const;
