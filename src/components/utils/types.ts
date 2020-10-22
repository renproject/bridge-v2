export enum CurrencySymbols {
  BTC = "BTC",
  BCH = "BCH",
  DOTS = "DOTS",
  DOGE = "DOGE",
  ZEC = "ZEC",
}

export type CurrencyType = keyof typeof CurrencySymbols;

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
