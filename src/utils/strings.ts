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

const vowels = "eaiou".split("");
export const isFirstVowel = (str: string) =>
  Boolean(str) &&
  str.length > 0 &&
  vowels.includes(str.charAt(0).toLowerCase());
