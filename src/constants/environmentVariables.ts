const TARGET_NETWORK = process.env.REACT_APP_TARGET_NETWORK || "";
const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || "";
const BANDCHAIN_ENDPOINT =
  process.env.REACT_APP_BANDCHAIN_ENDPOINT || "https://poa-api.bandchain.org";

export const env = {
  TARGET_NETWORK,
  INFURA_KEY,
  BANDCHAIN_ENDPOINT,
};

console.log("env", env, process, env);
