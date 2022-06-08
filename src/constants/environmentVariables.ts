import { RenNetwork } from "@renproject/utils";

const cachedTargetNetwork = localStorage.getItem("renTargetNetwork");
const NETWORK =
  ((cachedTargetNetwork ||
    process.env.REACT_APP_NETWORK) as unknown as RenNetwork) ||
  RenNetwork.Testnet;

const INFURA_ID =
  process.env.REACT_APP_INFURA_ID || process.env.REACT_APP_INFURA_KEY || "";
const DEV = Boolean(process.env.NODE_ENV === "development");

const MEWCONNECT_ENABLED = Boolean(process.env.REACT_APP_MEWCONNECT_ENABLED);
const WALLETCONNECT_ENABLED = Boolean(
  process.env.REACT_APP_WALLETCONNECT_ENABLED
);
const BSC_MM_ENABLED = Boolean(process.env.REACT_APP_BSC_MM_ENABLED);

//like "Ethereum/MyEtherWallet|WalletConnect,BinanceSmartChain/MetaMask";
const ENABLED_EXTRA_WALLETS =
  process.env.REACT_APP_ENABLED_EXTRA_WALLETS?.split(",") || ["*"];

const ENABLED_ASSETS = process.env.REACT_APP_ENABLED_ASSETS?.split(",") || [
  "*",
];

export const env = {
  DEV,
  NETWORK,
  INFURA_ID,
  ENABLED_ASSETS,
  ENABLED_EXTRA_WALLETS,
  BSC_MM_ENABLED,
  MEWCONNECT_ENABLED,
  WALLETCONNECT_ENABLED,
};

console.debug("env", env, process);
