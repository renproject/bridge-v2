import { useMemo } from "react";
import Web3 from "web3";
import { useSelectedChainWallet } from "../providers/multiwallet/multiwalletHooks";

const getWeb3Signatures = async (address: string, web3: Web3) => {
  const localSigMap = JSON.parse(localStorage.getItem("sigMap") || "{}");
  const localRawSigMap = JSON.parse(localStorage.getItem("rawSigMap") || "{}");
  const addressLowerCase = address.toLowerCase();

  let signature: string | null = localSigMap[addressLowerCase];
  let rawSignature: string | null = localRawSigMap[addressLowerCase];

  if (!signature || !rawSignature) {
    // get unique wallet signature for database backup
    rawSignature = await web3.eth.personal.sign(
      web3.utils.utf8ToHex("Signing in to Ren Bridge"),
      addressLowerCase,
      ""
    );
    localRawSigMap[addressLowerCase] = rawSignature;
    localStorage.setItem("rawSigMap", JSON.stringify(localRawSigMap));

    signature = web3.utils.sha3(rawSignature);
    localSigMap[addressLowerCase] = signature;
    localStorage.setItem("sigMap", JSON.stringify(localSigMap));
  }
  return { signature, rawSignature };
};

// TODO TBD: cache for more wallet providers?
const useWeb3 = () => {
  const { provider } = useSelectedChainWallet();
  return useMemo(() => new Web3(provider), [provider]);
};

export const useWeb3Signatures = () => {
  const { account } = useSelectedChainWallet();
  const web3 = useWeb3();
  return useMemo(() => {
    console.log("useWeb3Signatures regenrating", account, web3);
    if (account && web3) {
      return getWeb3Signatures(account, web3);
    }
    return { signature: "", rawSignature: "" };
  }, [account, web3]);
};
