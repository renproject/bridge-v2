export const getRemainingTime = (expiryTime: number) =>
  Math.ceil(expiryTime - Number(new Date()));
