import {
  BridgeChain,
  ChainType,
  CurrencySymbols,
  CurrencyType,
} from "../components/utils/types";

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type RentxAssetConfig = {
  rentxName: string;
};

export type CurrencyConfig = LabelsConfig & RentxAssetConfig;

export const currenciesConfig: Record<CurrencySymbols, CurrencyConfig> = {
  [CurrencySymbols.BTC]: {
    short: "BTC",
    full: "Bitcoin",
    rentxName: "btc",
  },
  [CurrencySymbols.BCH]: {
    short: "BCH",
    full: "Bitcoin Cash",
    rentxName: "bch",
  },
  [CurrencySymbols.DOTS]: {
    short: "DOTS",
    full: "Polkadot",
    rentxName: "dots",
  },
  [CurrencySymbols.DOGE]: {
    short: "DOGE",
    full: "Dogecoin",
    rentxName: "doge",
  },
  [CurrencySymbols.ZEC]: {
    short: "ZEC",
    full: "Zcash",
    rentxName: "zec",
  },
  [CurrencySymbols.RENBTC]: {
    short: "renBTC",
    full: "renBTC",
    rentxName: "renBTC",
  },
  [CurrencySymbols.RENBCH]: {
    short: "renBCH",
    full: "renBCH",
    rentxName: "renBCH",
  },
  [CurrencySymbols.RENDOGE]: {
    short: "renDOGE",
    full: "renDOGE",
    rentxName: "renDOGE",
  },
  [CurrencySymbols.RENZEC]: {
    short: "renZEC",
    full: "renZEC",
    rentxName: "renZEC",
  },
  [CurrencySymbols.RENDGB]: {
    short: "renDGB",
    full: "renDGB",
    rentxName: "renDGB",
  },
  [CurrencySymbols.ETH]: {
    short: "ETH",
    full: "Ether",
    rentxName: "eth",
  },
};

export const getCurrencyShortLabel = (symbol: CurrencyType) =>
  currenciesConfig[symbol].short || unknownLabel;

export const getCurrencyFullLabel = (symbol: CurrencyType) =>
  currenciesConfig[symbol].full || unknownLabel;

export const getCurrencyRentxName = (symbol: CurrencyType) =>
  currenciesConfig[symbol].rentxName || unknownLabel;

type RenChainConfig = {
  rentxName: string;
};

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
    rentxName: "bitcoin",
  },
};

export const getChainShortLabel = (symbol: ChainType) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainFullLabel = (symbol: ChainType) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainRentxName = (symbol: ChainType) =>
  chainsConfig[symbol].full || unknownLabel;

