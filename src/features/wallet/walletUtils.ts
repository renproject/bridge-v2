// TODO: Move to multiwallet
import { Chain } from "@renproject/chains";

export enum WalletStatus {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  WrongNetwork = "wrong_network",
}

export const getPaymentLink = (chain: Chain, address: string) => {
  if (chain === Chain.Zcash) {
    return `zcash:${address}`;
  }
  return `${chain.toLowerCase()}://${address}`;
};
