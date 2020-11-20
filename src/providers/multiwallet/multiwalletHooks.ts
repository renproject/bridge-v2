import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { useSelector } from "react-redux";
import { WalletConnectionStatusType } from "../../components/utils/types";
import { $multiwalletChain } from "../../features/wallet/walletSlice";

type WalletData = {
  account: string;
  status: WalletConnectionStatusType;
  targetNetwork: RenNetwork;
  provider: any;
};

type UseWallet = (chain: string) => WalletData;

// TODO: change status to walletStatus
export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork, ...rest } = useMultiwallet();
  console.log("multi", rest);
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  console.log("chains", enabledChains);
  const provider = enabledChains?.[chain]?.provider;
  return {
    account,
    status,
    targetNetwork,
    provider,
    enabledChains,
  } as WalletData;
};

export const useSelectedChainWallet = () => {
  const multiwalletChain = useSelector($multiwalletChain);
  return useWallet(multiwalletChain);
};
