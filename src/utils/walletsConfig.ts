// TODO: move to multiwallet
import { Chain } from "@renproject/chains";
import { BinanceChainWallet, MetaMask } from "@renproject/icons";
import { walletIcon } from "../components/icons/IconHelpers";
import {
  CustomSvgIconComponent,
  EmptyCircleIcon,
} from "../components/icons/RenIcons";
import { assetsConfig } from "./tokensConfig";

export enum Wallet {
  MetaMask = "MetaMask",
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
  BinanceSmartChain: {
    fullName: "Binance Chain Wallet",
    shortName: "Binance Wallet",
    Icon: walletIcon(BinanceChainWallet),
  },
  MetaMask: {
    fullName: "MetaMask Wallet",
    shortName: "MetaMask",
    Icon: walletIcon(MetaMask),
  },
  MewConnect: unsetWalletConfig,
  Phantom: unsetWalletConfig,
  Sollet: unsetWalletConfig,
  WalletConnect: unsetWalletConfig,
};

export const walletsConfig = walletsBaseConfig;

export const getWalletConfig = (wallet: Wallet) => {
  const config = walletsConfig[wallet];
  if (!config) {
    throw new Error(`Wallet config not found for ${wallet}`);
  }
  return config;
};

const defaultChainWallets: Partial<Record<Chain, Wallet>> = {
  [Chain.Ethereum]: Wallet.MetaMask,
  [Chain.BinanceSmartChain]: Wallet.BinanceSmartChain,
  [Chain.Fantom]: Wallet.MetaMask,
  [Chain.Polygon]: Wallet.MetaMask,
  [Chain.Avalanche]: Wallet.MetaMask,
  [Chain.Arbitrum]: Wallet.MetaMask,
  // [Chain.Solana]: Wallet.Sollet
};

export const getDefaultWalletForChain = (chain: Chain) => {
  const wallet = defaultChainWallets[chain];
  if (wallet) {
    return wallet;
  }
  console.warn(`Unable to find default wallet for chain: ${chain})`);
  return Wallet.MetaMask;
};
