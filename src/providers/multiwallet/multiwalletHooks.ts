import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { useSelector } from "react-redux";
import {
  WalletConnectionStatusType,
  WalletStatus,
} from "../../components/utils/types";
import { $multiwalletChain } from "../../features/wallet/walletSlice";
import { BridgeWallet } from "../../utils/assetConfigs";

type WalletData = {
  account: string;
  status: WalletConnectionStatusType;
  walletConnected: boolean;
  targetNetwork: RenNetwork;
  provider: any;
  symbol: BridgeWallet;
};

const resolveWallet = (provider: any) => {
  if (provider?.isMetaMask) {
    return BridgeWallet.METAMASKW;
  } else if (
    provider?.chainId === "0x61" ||
    provider?.chainId.indexOf("Binance")
  ) {
    return BridgeWallet.BINANCESMARTW;
  }
  return BridgeWallet.UNKNOWNW;
};

type UseWallet = (chain: string) => WalletData;

// TODO: change status to walletStatus
export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork } = useMultiwallet();
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  const symbol = resolveWallet(provider);
  return {
    account,
    status,
    walletConnected: status === WalletStatus.CONNECTED,
    targetNetwork,
    provider,
    enabledChains,
    symbol,
  } as WalletData;
};

export const useSelectedChainWallet = () => {
  const multiwalletChain = useSelector($multiwalletChain);
  return useWallet(multiwalletChain);
};
