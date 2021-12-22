// TODO: move to multiwallet
import { Asset, Chain } from "@renproject/chains";
import { MetaMask } from "@renproject/icons";
import { walletIcon } from "../components/icons/IconHelpers";
import {
  CustomSvgIconComponent,
  EmptyCircleIcon,
} from "../components/icons/RenIcons";
import { assetsConfig } from "./tokensConfig";

export enum Wallet {
  Metamask = "Metamask",
  WalletConnect = "WalletConnect",
  MewConnect = "MewConnect",
  BinanceSmartChain = "BinanceSmartChain",
  Sollet = "Sollet",
  Phantom = "Phantom",
}

export type WalletIconsConfig = {
  Icon: CustomSvgIconComponent;
};

export type WalletLabelsConfig = {
  fullName: string;
  shortName?: string;
};

type WalletBaseConfig = WalletIconsConfig & WalletLabelsConfig & {};

const unsetWalletConfig: WalletBaseConfig = {
  Icon: EmptyCircleIcon,
  fullName: "Unset full name",
};

const walletsBaseConfig: Record<Wallet, WalletBaseConfig> = {
  BinanceSmartChain: unsetWalletConfig,
  Metamask: {
    fullName: "MetaMask Wallets",
    Icon: walletIcon(MetaMask),
  },
  MewConnect: unsetWalletConfig,
  Phantom: unsetWalletConfig,
  Sollet: unsetWalletConfig,
  WalletConnect: unsetWalletConfig,
};

export const walletsConfig = walletsBaseConfig;

export const getWalletConfig = (wallet: Wallet) => {
  const config = assetsConfig[wallet];
  if (!config) {
    throw new Error(`Wallet config not found for ${wallet}`);
  }
  return config;
};
