import { BridgeChain, BridgeCurrency, } from '../components/utils/types'

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type RentxAssetConfig = {
  rentxName: string;
};

export type CurrencyConfig = LabelsConfig & RentxAssetConfig;

export const currenciesConfig: Record<BridgeCurrency, CurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    short: "BTC",
    full: "Bitcoin",
    rentxName: "btc",
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
  },
  [BridgeCurrency.RENBCH]: {
    short: "renBCH",
    full: "renBCH",
    rentxName: "renBCH",
  },
  [BridgeCurrency.RENDOGE]: {
    short: "renDOGE",
    full: "renDOGE",
    rentxName: "renDOGE",
  },
  [BridgeCurrency.RENZEC]: {
    short: "renZEC",
    full: "renZEC",
    rentxName: "renZEC",
  },
  [BridgeCurrency.RENDGB]: {
    short: "renDGB",
    full: "renDGB",
    rentxName: "renDGB",
  },
  [BridgeCurrency.ETH]: {
    short: "ETH",
    full: "Ether",
    rentxName: "eth",
  },
};

export const getCurrencyShortLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].short || unknownLabel;

export const getCurrencyFullLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].full || unknownLabel;

export const getCurrencyRentxName = (symbol: BridgeCurrency) =>
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

export const getChainShortLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainFullLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainRentxName = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

