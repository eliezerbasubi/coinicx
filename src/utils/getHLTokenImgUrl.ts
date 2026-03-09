const PRIMARY_ASSETS = ["USDC", "HYPE", "PURR"];

export const getHLTokenImgUrl = (name: string, isSpot = false) => {
  if (!name) return "";

  let path = name;

  if (PRIMARY_ASSETS.includes(name)) {
    path = name;
  } else if (isSpot) {
    path = name + "_spot";
  }

  return `https://app.hyperliquid.xyz/coins/${path}.svg`;
};
