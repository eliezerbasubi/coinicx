export const isValidAddress = (network: string, address: string) => {
  switch (network) {
    case "arbitrum":
    case "monad":
    case "plasma":
    case "ethereum":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "bitcoin":
      return /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{8,87})$/.test(
        address,
      );
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    default:
      return false;
  }
};
