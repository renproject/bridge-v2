import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { WalletStatus } from "../../components/utils/types";
import { useWallet } from "../../providers/multiwallet/multiwalletHooks";
import {
  getBurnAndReleaseFees,
  getLockAndMintFees,
} from "../../services/rentx";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $renNetwork } from "../network/networkSlice";
import { TxType } from "../transactions/transactionsUtils";
import { $multiwalletChain, $walletSyncing } from "../wallet/walletSlice";
import { isSupportedByCurrentNetwork } from "../wallet/walletUtils";
import { SimpleFee } from "./feesUtils";

const feesCache: Record<string, SimpleFee> = {};
export const useFetchFees = (currency: BridgeCurrency, txType: TxType) => {
  const multiwalletChain = useSelector($multiwalletChain);
  const { provider, walletConnected } = useWallet(multiwalletChain);
  const renNetwork = useSelector($renNetwork);
  const walletSyncing = useSelector($walletSyncing);
  const initialFees: SimpleFee = {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  };
  const [fees, setFees] = useState(initialFees);
  const [pending, setPending] = useState(true);

  console.log(
    currency,
    renNetwork,
    isSupportedByCurrentNetwork(currency, renNetwork),
    walletSyncing
  );

  useEffect(() => {
    console.log(provider);
  }, [provider]);

  useEffect(() => {
    console.log(provider?.chainId);
  }, [provider?.chainId]);

  useEffect(() => {
    const cacheKey = `${currency}-${txType}-${renNetwork}`;
    if (
      provider &&
      walletConnected &&
      isSupportedByCurrentNetwork(currency, renNetwork) &&
      !walletSyncing
    ) {
      if (false && feesCache[cacheKey]) {
        setFees(feesCache[cacheKey]);
        setPending(false);
      } else {
        const fetchFees =
          txType === TxType.MINT ? getLockAndMintFees : getBurnAndReleaseFees;
        console.log("fetching fees", renNetwork, provider.chainId);
        fetchFees(currency, provider, renNetwork, multiwalletChain)
          .then((feeRates) => {
            feesCache[cacheKey] = feeRates;
            setFees(feesCache[cacheKey]);
            setPending(false);
          })
          .catch(console.error);
      }
    }
  }, [
    currency,
    provider,
    walletConnected,
    renNetwork,
    txType,
    multiwalletChain,
    walletSyncing,
  ]);

  return { fees, pending };
};
