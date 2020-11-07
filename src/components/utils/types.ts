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
  ETH = "ETH",
  UNKNOWN = "UNKNOWN",
}

export enum BridgeChain {
  BTCC = "BTCC",
  BNCC = "BNCC",
  ETHC = "ETHC",
  UNKNOWNC = "UNKNOWNC",
}

export enum BridgeNetwork {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
  UNKNOWN = "UNKNOWN",
}

export type TransactionStatusType = "completed" | "pending" | "submitted";

// multiwallet compatible
export enum WalletStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  WRONG_NETWORK = "wrong_network",
}

export type WalletConnectionStatusType =
  | "disconnected"
  | "connecting"
  | "connected"
  | "wrong_network";
