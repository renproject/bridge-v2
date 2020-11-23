export const trimAddress = (address?: string, chars = 4) => {
  if (!address) {
    return "";
  }
  if (address.length <= 2 * chars) {
    return address;
  }
  const start = address.slice(0, chars);
  const end = address.slice(-chars);
  return `${start}...${end}`;
};
