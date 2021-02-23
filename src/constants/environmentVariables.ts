const NETWORK = process.env.REACT_APP_NETWORK || "testnet";
const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || "";
const BANDCHAIN_ENDPOINT =
  process.env.REACT_APP_BANDCHAIN_ENDPOINT || "https://poa-api.bandchain.org";
const GAS_FEE_ENDPOINT =
  process.env.REACT_APP_GAS_FEE_ENDPOINT ||
  "https://api.anyblock.tools/ethereum/latest-minimum-gasprice/?pretty";
const FIREBASE_KEY = process.env.REACT_APP_FIREBASE_KEY || null;
const FIREBASE_PROJECT_ID =
  process.env.REACT_APP_FIREBASE_PROJECT_ID || "ren-auth";

const XSTATE_DEVTOOLS = Boolean(
  process.env.REACT_APP_XSTATE_DEVTOOLS ||
    process.env.NODE_ENV === "development"
);

const GH_PAGES = Boolean(process.env.REACT_APP_GH_PAGES);

export const env = {
  NETWORK,
  INFURA_KEY,
  FIREBASE_KEY,
  FIREBASE_PROJECT_ID,
  BANDCHAIN_ENDPOINT,
  GAS_FEE_ENDPOINT,
  XSTATE_DEVTOOLS,
  GH_PAGES,
};

console.debug("env", env, process);
