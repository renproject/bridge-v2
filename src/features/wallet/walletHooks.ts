import { useSelector } from "react-redux";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { useSignatures } from "../../services/web3";
import { $walletUser } from "./walletSlice";

export const useWalletAuthentication = () => {
  const { account } = useSelectedChainWallet();
  const user = useSelector($walletUser);
  const { getSignatures } = useSignatures();
  const isAuthenticated = user !== null && account === user.uid;

  return { isAuthenticated, authenticate: getSignatures };
};
