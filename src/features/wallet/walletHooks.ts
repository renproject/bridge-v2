import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  WalletConnectionStatusType,
  WalletStatus,
} from "../../components/utils/types";
import { BridgeWallet } from "../../utils/assetConfigs";
import { $renNetwork } from "../network/networkSlice";
import { $multiwalletChain } from "./walletSlice";

type WalletData = ReturnType<typeof useMultiwallet> & {
  account: string;
  status: WalletConnectionStatusType;
  walletConnected: boolean;
  provider: any;
  symbol: BridgeWallet;
  deactivateConnector: () => void;
};

const resolveWallet = (provider: any) => {
  if (provider?.isMetaMask) {
    return BridgeWallet.METAMASKW;
  }

  if (provider?.wallet?._providerUrl?.href?.includes("sollet")) {
    return BridgeWallet.SOLLETW;
  }

  if (provider?.wallet) {
    return BridgeWallet.PHANTOMW;
  }

  if (provider?.chainId === "0x61" || provider?.chainId?.indexOf("Binance")) {
    return BridgeWallet.BINANCESMARTW;
  }

  if (provider?.isMewConnect || provider?.isMEWConnect) {
    return BridgeWallet.MEWCONNECTW;
  }

  return BridgeWallet.UNKNOWNW;
};

type UseWallet = (chain: string) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const {
    enabledChains,
    targetNetwork,
    activateConnector,
    setTargetNetwork,
  } = useMultiwallet();
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  const symbol = resolveWallet(provider);
  const emptyFn = () => {};
  const deactivateConnector =
    enabledChains[chain]?.connector.deactivate || emptyFn;

  return {
    account,
    status,
    walletConnected: status === WalletStatus.CONNECTED,
    provider,
    symbol,
    targetNetwork,
    enabledChains,
    activateConnector,
    setTargetNetwork,
    deactivateConnector,
  } as WalletData;
};

export const useSelectedChainWallet = () => {
  const multiwalletChain = useSelector($multiwalletChain);
  return useWallet(multiwalletChain);
};

export const useSyncMultiwalletNetwork = () => {
  const { targetNetwork, setTargetNetwork } = useSelectedChainWallet();
  const renNetwork = useSelector($renNetwork);
  useEffect(() => {
    if (renNetwork !== targetNetwork) {
      setTargetNetwork(
        renNetwork.includes("mainnet")
          ? RenNetwork.Mainnet
          : renNetwork.includes("testnet")
          ? RenNetwork.Testnet
          : renNetwork
      );
    }
  }, [renNetwork, setTargetNetwork, targetNetwork]);
};
