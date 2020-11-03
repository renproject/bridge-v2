const NETWORK = process.env.REACT_APP_NETWORK || "testnet";
const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || "";
const BANDCHAIN_ENDPOINT =
  process.env.REACT_APP_BANDCHAIN_ENDPOINT || "https://poa-api.bandchain.org";
const GAS_FEE_ENDPOINT =
  process.env.REACT_APP_GAS_FEE_ENDPOINT ||
  "https://api.anyblock.tools/ethereum/latest-minimum-gasprice/?pretty";

export const env = {
  NETWORK,
  INFURA_KEY,
  BANDCHAIN_ENDPOINT,
  GAS_FEE_ENDPOINT,
};

console.log("env", env, process);
