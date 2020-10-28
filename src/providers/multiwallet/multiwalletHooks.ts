import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { WalletConnectionStatusType } from "../../components/utils/types";

type UseWallet = (
  chain: string
) => {
  account: string | unknown;
  status: WalletConnectionStatusType;
  targetNetwork: RenNetwork;
};

export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork } = useMultiwallet();
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  return { account, status, targetNetwork };
};
