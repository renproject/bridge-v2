export enum BridgeCurrency {
  BTC = "BTC",
  BCH = "BCH",
  DOTS = "DOTS",
  DOGE = "DOGE",
  ZEC = "ZEC",
  RENBTC = "RENBTC",
  RENBCH = "RENBCH",
  RENDOGE = "RENDOGE",
  RENZEC = "RENZEC",
  RENDGB = "RENDGB",
  ETH = "ETH"
}

export type CurrencyType = keyof typeof BridgeCurrency;

export enum BridgeChain {
  BTCC = "BTCC",
  BNCC = "BNCC",
  ETHC = "ETHC",
}

export type ChainType = keyof typeof BridgeChain;

export type TransactionStatusType = "completed" | "pending" | "submitted";

export type WalletConnectionStatusType =
  | "disconnected"
  | "connecting"
  | "connected"
  | "wrong_network";
