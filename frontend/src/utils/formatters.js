/**
 * Shorten Ethereum Wallet Address or Transaction Hash
 */
export const shortenAddress = (address, chars = 6) => {
  if (!address) return "N/A";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Format ISO date string into readable date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
};
