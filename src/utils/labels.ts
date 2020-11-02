import {
  BridgeChain,
  ChainType,
  CurrencySymbols,
  CurrencyType,
} from "../components/utils/types";

const unknownLabel = "unknown";

export type LabelData = {
  short: string;
  full: string;
};

export const currencyLabels: Record<CurrencyType, LabelData> = {
  // TODO create more generic currencyData
  [CurrencySymbols.BTC]: {
    short: "BTC",
    full: "Bitcoin",
  },
  [CurrencySymbols.BCH]: {
    short: "BCH",
    full: "Bitcoin Cash",
  },
  [CurrencySymbols.DOTS]: {
    short: "DOTS",
    full: "Polkadot",
  },
  [CurrencySymbols.DOGE]: {
    short: "DOGE",
    full: "Dogecoin",
  },
  [CurrencySymbols.ZEC]: {
    short: "ZEC",
    full: "Zcash",
  },
  [CurrencySymbols.RENBTC]: {
    short: "renBTC",
    full: "renBTC",
  },
  [CurrencySymbols.RENBCH]: {
    short: "renBCH",
    full: "renBCH",
  },
  [CurrencySymbols.RENDOGE]: {
    short: "renDOGE",
    full: "renDOGE",
  },
  [CurrencySymbols.RENZEC]: {
    short: "renZEC",
    full: "renZEC",
  },
  [CurrencySymbols.RENDGB]: {
    short: "renDGB",
    full: "renDGB",
  },
  [CurrencySymbols.ETH]: {
    short: "ETH",
    full: "Ether",
  },
};

export const getCurrencyFullLabel = (symbol: CurrencyType) =>
  currencyLabels[symbol].full || unknownLabel;

export const getCurrencyShortLabel = (symbol: CurrencyType) =>
  currencyLabels[symbol].short || unknownLabel;

export const chainLabels: Record<ChainType, LabelData> = {
  [BridgeChain.BTCC]: {
    short: "BTCC",
    full: "Bitcoin SmartChain",
  },
  [BridgeChain.BNCC]: {
    short: "BNCC",
    full: "Binance SmartChain",
  },
  [BridgeChain.ETHC]: {
    short: "ETHC",
    full: "Ethereum",
  },
};

export const getChainFullLabel = (symbol: ChainType) =>
  chainLabels[symbol].full || unknownLabel;

export const getChainShortLabel = (symbol: ChainType) =>
  chainLabels[symbol].full || unknownLabel;
