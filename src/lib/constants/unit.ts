export type UnitSpotAssetToken = {
  symbol: string;
  name: string;
  minAmount: number;
  tokenIndex: number;
  decimals: number;
  spotSendTokenName?: string;
  depositEta?: string;
  withdrawalEta?: string;
  balance?: string;
  balanceNtl?: string;
  assetUrl?: string;
};

export type UnitSpotAsset = {
  assetUrl?: string;
  depositEta: string;
  withdrawalEta: string;
  symbol: string;
  name: string;
  isPerps?: boolean;
  tokens: Record<string, UnitSpotAssetToken>;
};

const UNIT_MAINNET_SPOT_ASSETS: Record<string, UnitSpotAsset> = {
  bitcoin: {
    depositEta: "21m",
    withdrawalEta: "14m",
    symbol: "BTC",
    name: "Bitcoin",
    tokens: {
      btc: {
        symbol: "BTC",
        name: "Bitcoin",
        minAmount: 0.0003,
        tokenIndex: 197,
        decimals: 8,
        spotSendTokenName: "UBTC:0x8f254b963e8468305d409b33aa137c67",
      },
    },
  },
  ethereum: {
    depositEta: "3m",
    withdrawalEta: "7m",
    symbol: "ETH",
    name: "Ethereum",
    tokens: {
      eth: {
        symbol: "ETH",
        name: "Ethereum",
        minAmount: 0.007,
        tokenIndex: 221,
        decimals: 18,
        spotSendTokenName: "UETH:0xe1edd30daaf5caac3fe63569e24748da",
      },
      ena: {
        symbol: "ENA",
        name: "Ethena",
        minAmount: 120,
        tokenIndex: 338,
        decimals: 18,
        spotSendTokenName: "UENA:0x593494b6af79172fa983a0cf1c88e0e0",
      },
    },
  },
  solana: {
    depositEta: "1m",
    withdrawalEta: "4m",
    symbol: "SOL",
    name: "Solana",
    tokens: {
      sol: {
        symbol: "SOL",
        name: "Solana",
        minAmount: 0.12,
        tokenIndex: 254,
        decimals: 9,
        spotSendTokenName: "USOL:0x49b67c39f5566535de22b29b0e51e685",
      },
      "2z": {
        symbol: "2Z",
        name: "Double Zero",
        minAmount: 150,
        tokenIndex: 361,
        decimals: 18,
        spotSendTokenName: "UDZ:0x9cd8fd4cae61e63a10ba7615780ee520",
      },
      bonk: {
        symbol: "BONK",
        name: "Bonk",
        minAmount: 1800000,
        tokenIndex: 320,
        decimals: 5,
        spotSendTokenName: "UBONK:0xb113d34e351cf195733c98442530c099",
      },
      fart: {
        symbol: "FARTCOIN",
        name: "Fartcoin",
        minAmount: 55,
        tokenIndex: 269,
        decimals: 6,
        spotSendTokenName: "UFART:0x7650808198966e4285687d3deb556ccc",
      },
      pump: {
        symbol: "PUMP",
        name: "Pump",
        minAmount: 5500,
        tokenIndex: 299,
        decimals: 6,
        spotSendTokenName: "UPUMP:0x544e60f98a36d7b22c0fb5824b84f795",
      },
      spxs: {
        symbol: "SPX",
        name: "SPX6900",
        minAmount: 32,
        tokenIndex: 319,
        decimals: 8,
        spotSendTokenName: "UUUSPX:0x2ff71b802a6788a052c7f1a58ec863af",
      },
    },
  },
  plasma: {
    depositEta: "1m",
    withdrawalEta: "4m",
    symbol: "XPL",
    name: "Plasma",
    tokens: {
      xpl: {
        symbol: "XPL",
        name: "Plasma",
        minAmount: 60,
        tokenIndex: 343,
        decimals: 18,
        spotSendTokenName: "UXPL:0x2c54c60600e1d786b2dfc139a38a5a99",
      },
    },
  },
  monad: {
    depositEta: "1m",
    withdrawalEta: "4m",
    symbol: "MON",
    name: "Monad",
    tokens: {
      mon: {
        symbol: "MON",
        name: "Monad",
        minAmount: 450,
        tokenIndex: 383,
        decimals: 18,
        spotSendTokenName: "UMON:0x58dae745c8c5fed4012f35ef39829c2d",
      },
    },
  },
};

const UNIT_TESTNET_SPOT_ASSETS: Record<string, UnitSpotAsset> = {
  bitcoin: {
    depositEta: "21m",
    withdrawalEta: "14m",
    symbol: "BTC",
    name: "Bitcoin",
    tokens: {
      btc: {
        symbol: "BTC",
        name: "Bitcoin",
        minAmount: 0.0003,
        tokenIndex: 1129,
        decimals: 9,
        spotSendTokenName: "UNIT:0x5314ecc85ee6059955409e0da8d2bd31",
      },
    },
  },
  ethereum: {
    depositEta: "3m",
    withdrawalEta: "7m",
    symbol: "ETH",
    name: "Ethereum",
    tokens: {
      eth: {
        symbol: "ETH",
        name: "Ethereum",
        minAmount: 0.007,
        tokenIndex: 1242,
        decimals: 18,
        spotSendTokenName: "UETH:0xe4371d8166f362d6578725f11e0a14f3",
      },
      ena: {
        symbol: "ENA",
        name: "Ethena",
        minAmount: 120,
        tokenIndex: 1474,
        decimals: 18,
        spotSendTokenName: "UUENA:0x8580a30d748007793bae9c6b539c04f7",
      },
    },
  },
  solana: {
    depositEta: "1m",
    withdrawalEta: "4m",
    symbol: "SOL",
    name: "Solana",
    tokens: {
      sol: {
        symbol: "SOL",
        name: "Solana",
        minAmount: 0.12,
        tokenIndex: 1279,
        decimals: 9,
        spotSendTokenName: "USOL:0x57ead23624b114018cc0e49d01cc7b6b",
      },
      "2z": {
        symbol: "2Z",
        name: "Double Zero",
        minAmount: 150,
        tokenIndex: 1427,
        decimals: 18,
        spotSendTokenName: "UDZ:0x4ccf31a4fa9fe7da667354a6e9519f65",
      },
      bonk: {
        symbol: "BONK",
        name: "Bonk",
        minAmount: 1800000,
        tokenIndex: 1381,
        decimals: 5,
        spotSendTokenName: "BONK:0xff6dfb63950e12ad4e7fad67b2c7d262",
      },
      fart: {
        symbol: "FARTCOIN",
        name: "Fartcoin",
        minAmount: 55,
        tokenIndex: 1301,
        decimals: 6,
        spotSendTokenName: "UFART:0x5c1a98b4df03401e19acb16bcf2ffabf",
      },
      pump: {
        symbol: "PUMP",
        name: "Pump",
        minAmount: 5500,
        tokenIndex: 1344,
        decimals: 6,
        spotSendTokenName: "UPUMP:0xdc348378290f167692e50bfb49c60696",
      },
      spxs: {
        symbol: "SPX",
        name: "SPX6900",
        minAmount: 32,
        tokenIndex: 1370,
        decimals: 8,
        spotSendTokenName: "USPXS:0x2f5b5d85f4f86f683f681d2fa791adab",
      },
    },
  },
  monad: {
    depositEta: "1m",
    withdrawalEta: "4m",
    symbol: "MON",
    name: "Monad",
    tokens: {
      mon: {
        symbol: "MON",
        name: "Monad",
        minAmount: 450,
        tokenIndex: 1426,
        decimals: 18,
        spotSendTokenName: "UMON:0x1c1f6f16a42103218db1b627c1387dd6",
      },
    },
  },
  plasma: {
    depositEta: "1m",
    withdrawalEta: "4m",
    symbol: "XPL",
    name: "Plasma",
    tokens: {
      xpl: {
        symbol: "XPL",
        name: "Plasma",
        minAmount: 60,
        tokenIndex: 1398,
        decimals: 18,
        spotSendTokenName: "UXPL:0x9d63f24c61da7bd3c67ff78ed1799756",
      },
    },
  },
};

export const UNIT_SPOT_ASSETS = {
  Testnet: UNIT_TESTNET_SPOT_ASSETS,
  Mainnet: UNIT_MAINNET_SPOT_ASSETS,
};

export const PERPS_NATIVE_CHAINS_ASSETS: Record<string, UnitSpotAsset> = {
  arbitrum: {
    depositEta: "1m",
    withdrawalEta: "5m",
    assetUrl: "/assets/arbitrum.png",
    symbol: "ARB",
    name: "Arbitrum",
    isPerps: true,
    tokens: {
      usdc: {
        symbol: "USDC",
        name: "USD Coin",
        minAmount: 1,
        tokenIndex: 0,
        decimals: 18,
      },
    },
  },
};
