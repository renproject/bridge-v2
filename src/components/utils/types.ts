export enum CurrencySymbols {
  BTC = "BTC",
  BCH = "BCH",
  DOTS = "DOTS",
  DOGE = "DOGE",
  ZEC = "ZEC",
  RENBTC = "RENBTC",
  RENBCH = "RENBCH",
  RENDOGE = "RENDOGE",
  RENDGB = "RENDGB",
}

export type CurrencyType = keyof typeof CurrencySymbols;

export const currencyLabels = {
  [CurrencySymbols.BTC]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.BCH]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.DOTS]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.DOGE]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.ZEC]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.RENBTC]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.RENBCH]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.RENDOGE]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
  [CurrencySymbols.RENDGB]: {
    symbol: "BTC",
    fullName: "Bitcoin",
  },
};

export enum ChainSymbols {
  BTCC = "BTCC",
  BNCC = "BNCC",
  ETHC = "ETHC",
}

export type ChainType = keyof typeof ChainSymbols;

export type TransactionStatusType = "completed" | "pending" | "submitted";

export type WalletConnectionStatusType =
  | "disconnected"
  | "connecting"
  | "connected"
  | "wrong_network";
