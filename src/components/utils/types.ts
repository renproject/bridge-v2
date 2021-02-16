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
