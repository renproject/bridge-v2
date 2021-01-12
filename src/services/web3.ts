import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Web3 from "web3";
import { storageKeys } from "../constants/constants";
import {
  $multiwalletChain,
  setSignatures,
} from "../features/wallet/walletSlice";
import {
  useSelectedChainWallet,
  useWallet,
} from "../providers/multiwallet/multiwalletHooks";
import { RenChain } from "../utils/assetConfigs";
import { signWithBinanceChain } from "./wallets/bsc";

const SIGN_MESSAGE = "Signing in to Ren Bridge";

const getWeb3Signatures = async (
  address: string,
  web3: Web3,
  chain: RenChain
) => {
  const localSigMap = JSON.parse(
    localStorage.getItem(storageKeys.SIG_MAP) || "{}"
  );
  const localRawSigMap = JSON.parse(
    localStorage.getItem(storageKeys.RAW_SIG_MAP) || "{}"
  );
  const addressLowerCase = address.toLowerCase();

  let signature: string = localSigMap[addressLowerCase] || "";
  let rawSignature: string = localRawSigMap[addressLowerCase] || "";

  if (!signature || !rawSignature) {
    // get unique wallet signature for database backup
    if (
      chain === RenChain.ethereum ||
      // signing is actually based on wallet, not chain,
      // so use this style if the provider is eth
      // TODO: move signing functionality into multiwallet?
      (web3.currentProvider as any).connection.isMetaMask
    ) {
      rawSignature = await web3.eth.personal.sign(
        web3.utils.utf8ToHex(SIGN_MESSAGE),
        addressLowerCase,
        ""
      );
    } else if (chain === RenChain.binanceSmartChain) {
      rawSignature = await signWithBinanceChain(SIGN_MESSAGE);
    }

    localRawSigMap[addressLowerCase] = rawSignature;
    localStorage.setItem(
      storageKeys.RAW_SIG_MAP,
      JSON.stringify(localRawSigMap)
    );

    signature = web3.utils.sha3(rawSignature);
    localSigMap[addressLowerCase] = signature;
    localStorage.setItem(storageKeys.SIG_MAP, JSON.stringify(localSigMap));
  }
  return { signature, rawSignature };
};

// TODO TBD: cache for more wallet providers?
const useWeb3 = () => {
  const { provider } = useSelectedChainWallet();
  return useMemo(() => new Web3(provider), [provider]);
};

export const useWeb3Signatures = () => {
  const dispatch = useDispatch();
  const chain = useSelector($multiwalletChain);
  const { account } = useWallet(chain);
  const web3 = useWeb3();
  return useEffect(() => {
    if (account && web3) {
      // FIXME: handle any errors thrown here
      getWeb3Signatures(account, web3, chain).then((signatures) => {
        dispatch(setSignatures(signatures));
      });
    }
  }, [dispatch, chain, account, web3]);
};
