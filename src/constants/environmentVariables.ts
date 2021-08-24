const NETWORK = process.env.REACT_APP_NETWORK || "testnet";
const INFURA_ID = process.env.REACT_APP_INFURA_ID || "";

const BANDCHAIN_ENDPOINT =
  process.env.REACT_APP_BANDCHAIN_ENDPOINT || "https://api-gm-lb.bandchain.org";
const GAS_FEE_ENDPOINT =
  process.env.REACT_APP_GAS_FEE_ENDPOINT ||
  "https://api.anyblock.tools/ethereum/latest-minimum-gasprice/?pretty";

const DEV = Boolean(process.env.NODE_ENV === "development");

const XSTATE_DEVTOOLS = Boolean(process.env.REACT_APP_XSTATE_DEVTOOLS || DEV);

const MEWCONNECT_ENABLED = Boolean(process.env.REACT_APP_MEWCONNECT_ENABLED);
const WALLETCONNECT_ENABLED = Boolean(
  process.env.REACT_APP_WALLETCONNECT_ENABLED
);
const BSC_MM_ENABLED = Boolean(process.env.REACT_APP_BSC_MM_ENABLED);
const TX_HISTORY_EXPLORATION = Boolean(
  process.env.REACT_TX_HISTORY_EXPLORATION
);
const ENABLED_CURRENCIES = process.env.REACT_APP_ENABLED_CURRENCIES?.split(
  ","
) || ["*"];

const V2_DEPRECATION_TIME =
  new Date(process.env.REACT_APP_V2_DEPRECATION_DATE || "invalid").getTime() ||
  new Date("2222-12-12").getTime();

const REVERT_SOLANA_PAYLOADS_DATE =
  new Date(
    process.env.REACT_APP_REVERT_SOLANA_PAYLOADS_DATE || "invalid"
  ).getTime() || new Date("2222-12-12").getTime();

export const env = {
  DEV,
  NETWORK,
  INFURA_ID,
  BANDCHAIN_ENDPOINT,
  GAS_FEE_ENDPOINT,
  XSTATE_DEVTOOLS,
  BSC_MM_ENABLED,
  MEWCONNECT_ENABLED,
  WALLETCONNECT_ENABLED,
  TX_HISTORY_EXPLORATION,
  ENABLED_CURRENCIES,
  V2_DEPRECATION_TIME,
  REVERT_SOLANA_PAYLOADS_DATE,
};

if (DEV) console.debug("env", env, process);
