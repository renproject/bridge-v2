export const getRemainingTime = (expiryTime: number) =>
  Math.ceil(expiryTime - Number(new Date()));

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
