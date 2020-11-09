import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
} from "../components/utils/types";
import { orangeLight } from "../theme/colors";

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type RentxAssetConfig = {
  rentxName: string;
  sourceConfirmationTime?: number;
};

export type ColorsConfig = {
  color?: string;
};

export type CurrencyConfig = LabelsConfig &
  ColorsConfig &
  RentxAssetConfig & {
    symbol: BridgeCurrency;
    sourceChain?: BridgeChain;
  };

export const currenciesConfig: Record<BridgeCurrency, CurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    symbol: BridgeCurrency.BTC,
    short: "BTC",
    full: "Bitcoin",
    color: orangeLight,
    rentxName: "btc",
    sourceChain: BridgeChain.BTCC,
    sourceConfirmationTime: 15,
  },
  [BridgeCurrency.BCH]: {
    symbol: BridgeCurrency.BCH,
    short: "BCH",
    full: "Bitcoin Cash",
    rentxName: "bch",
  },
  [BridgeCurrency.DOTS]: {
    symbol: BridgeCurrency.DOTS,
    short: "DOTS",
    full: "Polkadot",
    rentxName: "dots",
  },
  [BridgeCurrency.DOGE]: {
    symbol: BridgeCurrency.DOGE,
    short: "DOGE",
    full: "Dogecoin",
    rentxName: "doge",
  },
  [BridgeCurrency.ZEC]: {
    symbol: BridgeCurrency.ZEC,
    short: "ZEC",
    full: "Zcash",
    rentxName: "zec",
  },
  [BridgeCurrency.RENBTC]: {
    symbol: BridgeCurrency.RENBTC,
    short: "renBTC",
    full: "renBTC",
    rentxName: "renBTC",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENBCH]: {
    symbol: BridgeCurrency.RENBCH,
    short: "renBCH",
    full: "renBCH",
    rentxName: "renBCH",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENDOGE]: {
    symbol: BridgeCurrency.RENDOGE,
    short: "renDOGE",
    full: "renDOGE",
    rentxName: "renDOGE",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENZEC]: {
    symbol: BridgeCurrency.RENZEC,
    short: "renZEC",
    full: "renZEC",
    rentxName: "renZEC",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENDGB]: {
    symbol: BridgeCurrency.RENDGB,
    short: "renDGB",
    full: "renDGB",
    rentxName: "renDGB",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.ETH]: {
    symbol: BridgeCurrency.ETH,
    short: "ETH",
    full: "Ether",
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.UNKNOWN]: {
    symbol: BridgeCurrency.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownCurrencyConfig = currenciesConfig[BridgeCurrency.UNKNOWN];

export const getCurrencyConfig = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol] || unknownCurrencyConfig;

export const getCurrencyShortLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].short || unknownLabel;

export const getCurrencyFullLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].full || unknownLabel;

export const getCurrencyConfigByRentxName = (name: string) =>
  Object.values(currenciesConfig).find(
    (currency) => currency.rentxName === name
  ) || unknownCurrencyConfig;

export const getCurrencyRentxName = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].rentxName || unknownLabel;

export const getCurrencySourceChain = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].sourceChain || BridgeChain.UNKNOWNC;

export const getCurrencyRentxSourceChain = (symbol: BridgeCurrency) => {
  const bridgeChain = getCurrencySourceChain(symbol);
  if (bridgeChain) {
    return getChainRentxName(bridgeChain);
  }
  return BridgeChain.UNKNOWNC;
};

type ChainConfig = LabelsConfig &
  RentxAssetConfig & {
    symbol: BridgeChain;
  };

export const chainsConfig: Record<BridgeChain, ChainConfig> = {
  [BridgeChain.BTCC]: {
    symbol: BridgeChain.BTCC,
    short: "BTC",
    full: "Bitcoin",
    rentxName: "bitcoin",
  },
  [BridgeChain.BNCC]: {
    symbol: BridgeChain.BNCC,
    short: "BNC",
    full: "Binance SmartChain",
    rentxName: "binanceSmartChain",
  },
  [BridgeChain.ETHC]: {
    symbol: BridgeChain.ETHC,
    short: "ETH",
    full: "Ethereum",
    rentxName: "ethereum",
  },
  [BridgeChain.UNKNOWNC]: {
    symbol: BridgeChain.UNKNOWNC,
    short: "UNKNOWNC",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownChainConfig = chainsConfig[BridgeChain.UNKNOWNC];

export const getChainConfig = (symbol: BridgeChain) =>
  chainsConfig[symbol] || unknownChainConfig;

export const getChainShortLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainFullLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainRentxName = (symbol: BridgeChain) =>
  chainsConfig[symbol].rentxName || unknownLabel;

export const getChainConfigByRentxName = (name: string) =>
  Object.values(chainsConfig).find((chain) => chain.rentxName === name) ||
  unknownChainConfig;

type NetworkConfig = LabelsConfig &
  RentxAssetConfig & {
    symbol: BridgeNetwork;
  };

export const networksConfig: Record<BridgeNetwork, NetworkConfig> = {
  [BridgeNetwork.MAINNET]: {
    symbol: BridgeNetwork.MAINNET,
    short: "MAINNET",
    full: "Mainnet",
    rentxName: "mainnet",
  },
  [BridgeNetwork.TESTNET]: {
    symbol: BridgeNetwork.TESTNET,
    short: "TESTNET",
    full: "Testnet",
    rentxName: "testnet",
  },
  [BridgeNetwork.UNKNOWN]: {
    symbol: BridgeNetwork.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownNetworkConfig = networksConfig[BridgeNetwork.UNKNOWN];

export const getNetworkConfigByRentxName = (name: string) =>
  Object.values(networksConfig).find((network) => network.rentxName === name) ||
  unknownNetworkConfig;
