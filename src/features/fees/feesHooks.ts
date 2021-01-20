import { useState } from "react";
import { useSelector } from "react-redux";
import { useDebounce } from "react-use";
import {
  getBurnAndReleaseFees,
  getLockAndMintFees,
} from "../../services/rentx";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $renNetwork } from "../network/networkSlice";
import { TxType } from "../transactions/transactionsUtils";
import { useWallet } from "../wallet/walletHooks";
import { $multiwalletChain } from "../wallet/walletSlice";
import { isSupportedByCurrentNetwork } from "../wallet/walletUtils";
import { SimpleFee } from "./feesUtils";

const feesCache: Record<string, SimpleFee> = {};
export const useFetchFees = (currency: BridgeCurrency, txType: TxType) => {
  const multiwalletChain = useSelector($multiwalletChain);
  const { provider, walletConnected } = useWallet(multiwalletChain);
  const renNetwork = useSelector($renNetwork);
  const initialFees: SimpleFee = {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  };
  const [fees, setFees] = useState(initialFees);
  const [pending, setPending] = useState(true);

  useDebounce(
    () => {
      const cacheKey = `${currency}-${txType}-${renNetwork}`;
      if (
        provider &&
        walletConnected &&
        isSupportedByCurrentNetwork(currency, renNetwork, multiwalletChain)
      ) {
        if (feesCache[cacheKey]) {
          setFees(feesCache[cacheKey]);
          setPending(false);
        } else {
          setPending(true);
          const fetchFees =
            txType === TxType.MINT ? getLockAndMintFees : getBurnAndReleaseFees;
          fetchFees(currency, provider, renNetwork, multiwalletChain)
            .then((feeRates) => {
              feesCache[cacheKey] = feeRates;
              setFees(feesCache[cacheKey]);
              setPending(false);
            })
            .catch(console.error);
        }
      }
    },
    1000,
    [currency, provider, walletConnected, renNetwork, txType, multiwalletChain]
  );

  return { fees, pending };
};
