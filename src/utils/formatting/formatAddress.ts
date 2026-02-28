export const formatAddress = (address: string, truns: number = 4) => {
  if (!address) return "No Account";
  return `${address.slice(0, truns)}…${address.slice(-(truns - 1))}`;
};
