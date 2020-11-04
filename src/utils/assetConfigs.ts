import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
} from "../components/utils/types";

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type RentxAssetConfig = {
  rentxName: string;
};

export type CurrencyConfig = LabelsConfig &
  RentxAssetConfig & {
    sourceChain?: BridgeChain;
  };

export const currenciesConfig: Record<BridgeCurrency, CurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    short: "BTC",
    full: "Bitcoin",
    rentxName: "btc",
    sourceChain: BridgeChain.BTCC,
  },
  [BridgeCurrency.BCH]: {
    short: "BCH",
    full: "Bitcoin Cash",
    rentxName: "bch",
  },
  [BridgeCurrency.DOTS]: {
    short: "DOTS",
    full: "Polkadot",
    rentxName: "dots",
  },
  [BridgeCurrency.DOGE]: {
    short: "DOGE",
    full: "Dogecoin",
    rentxName: "doge",
  },
  [BridgeCurrency.ZEC]: {
    short: "ZEC",
    full: "Zcash",
    rentxName: "zec",
  },
  [BridgeCurrency.RENBTC]: {
    short: "renBTC",
    full: "renBTC",
    rentxName: "renBTC",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENBCH]: {
    short: "renBCH",
    full: "renBCH",
    rentxName: "renBCH",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENDOGE]: {
    short: "renDOGE",
    full: "renDOGE",
    rentxName: "renDOGE",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENZEC]: {
    short: "renZEC",
    full: "renZEC",
    rentxName: "renZEC",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENDGB]: {
    short: "renDGB",
    full: "renDGB",
    rentxName: "renDGB",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.ETH]: {
    short: "ETH",
    full: "Ether",
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.UNKNOWN]: {
    short: "UNKNOWN",
    full: "Unknown",
    rentxName: "unknown",
  },
};

export const getCurrencyShortLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].short || unknownLabel;

export const getCurrencyFullLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].full || unknownLabel;

export const getCurrencyRentxName = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].rentxName || unknownLabel;

export const getCurrencySourceChain = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].sourceChain;

export const getCurrencyRentxSourceChain = (symbol: BridgeCurrency) => {
  const bridgeChain = getCurrencySourceChain(symbol);
  if (bridgeChain) {
    return getChainRentxName(bridgeChain);
  }
  return BridgeChain.UNKNOWNC;
};

export const getCurrencyRentxNameByChain = (chain: BridgeChain) => {};

type ChainConfig = LabelsConfig & RentxAssetConfig;

export const chainsConfig: Record<BridgeChain, ChainConfig> = {
  [BridgeChain.BTCC]: {
    short: "BTCC",
    full: "Bitcoin",
    rentxName: "bitcoin",
  },
  [BridgeChain.BNCC]: {
    short: "BNCC",
    full: "Binance SmartChain",
    rentxName: "binanceSmartChain",
  },
  [BridgeChain.ETHC]: {
    short: "ETHC",
    full: "Ethereum",
    rentxName: "ethereum",
  },
  [BridgeChain.UNKNOWNC]: {
    short: "UNKNOWNC",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownChainConfig = chainsConfig[BridgeChain.UNKNOWNC];

export const getChainShortLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainFullLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainRentxName = (symbol: BridgeChain) =>
  chainsConfig[symbol].rentxName || unknownLabel;

export const getChainConfigByRentxName = (name: string) =>
  Object.values(chainsConfig).find((chain) => chain.rentxName === name) ||
  unknownChainConfig;

type NetworkConfig = LabelsConfig & RentxAssetConfig;

export const networksConfig: Record<BridgeNetwork, NetworkConfig> = {
  [BridgeNetwork.MAINNET]: {
    short: "MAINNET",
    full: "Mainnet",
    rentxName: "mainnet",
  },
  [BridgeNetwork.TESTNET]: {
    short: "TESTNET",
    full: "Testnet",
    rentxName: "testnet",
  },
  [BridgeNetwork.UNKNOWN]: {
    short: "UNKNOWN",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownNetworkConfig = networksConfig[BridgeNetwork.UNKNOWN];

export const getNetworkConfigByRentxName = (name: string) =>
  Object.values(networksConfig).find((network) => network.rentxName === name) ||
  unknownNetworkConfig;
