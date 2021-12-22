import { Chain } from "@renproject/chains";
import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { Wallet } from "../../utils/walletsConfig";
import { $network } from "../network/networkSlice";
import { $wallet } from "./walletSlice";
import { WalletStatus } from "./walletUtils";

type WalletData = ReturnType<typeof useMultiwallet> & {
  account: string;
  status: WalletStatus;
  connected: boolean;
  provider: any;
  wallet: Wallet;
  deactivateConnector: () => void;
};

const resolveWalletByProvider = (provider: any) => {
  if (!provider) {
    return Wallet.MetaMask; // TODO: is it valid ?
  }
  if (provider?.isMetaMask) {
    return Wallet.MetaMask;
  }
  if (provider?.wallet?._providerUrl?.href?.includes("sollet")) {
    return Wallet.Sollet;
  }
  if (provider?.wallet) {
    return Wallet.Phantom;
  }
  if (provider?.chainId === "0x61" || provider?.chainId?.indexOf("Binance")) {
    return Wallet.BinanceSmartChain;
  }
  if (provider?.isMewConnect || provider?.isMEWConnect) {
    return Wallet.MewConnect;
  }
  console.warn("Unresolved wallet", provider);
  return Wallet.MetaMask; // throw error?
};

type UseWallet = (chain: Chain) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork, activateConnector, setTargetNetwork } =
    useMultiwallet();
  const { account = "", status = WalletStatus.Disconnected } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  const wallet = resolveWalletByProvider(provider);
  const emptyFn = () => {};
  const deactivateConnector =
    enabledChains[chain]?.connector.deactivate || emptyFn;

  (window as any).p = provider;
  return {
    account,
    status,
    connected: status === WalletStatus.Connected,
    provider,
    wallet,
    targetNetwork,
    enabledChains,
    activateConnector,
    setTargetNetwork,
    deactivateConnector,
  } as WalletData;
};

export const useCurrentChainWallet = () => {
  const { chain } = useSelector($wallet);
  return useWallet(chain);
};

export const useSyncWalletNetwork = () => {
  const { chain } = useSelector($wallet);
  const { network } = useSelector($network);
  const { targetNetwork, setTargetNetwork } = useWallet(chain);
  useEffect(() => {
    if (network !== targetNetwork) {
      setTargetNetwork(
        network.includes("mainnet")
          ? RenNetwork.Mainnet
          : network.includes("testnet")
          ? RenNetwork.Testnet
          : network
      );
    }
  }, [network, setTargetNetwork, targetNetwork]);
};
