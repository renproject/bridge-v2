import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { WalletConnectionStatusType } from "../../components/utils/types";

type WalletData = {
  account: string;
  status: WalletConnectionStatusType;
  targetNetwork: RenNetwork;
};

type UseWallet = (chain: string) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork } = useMultiwallet();
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  return { account, status, targetNetwork } as WalletData;
};
