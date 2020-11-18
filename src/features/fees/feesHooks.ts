import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { WalletStatus } from "../../components/utils/types";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import {
  getBurnAndReleaseFees,
  getLockAndMintFees,
} from "../../services/rentx";
import { BridgeCurrency } from "../../utils/assetConfigs";
import { $network } from "../network/networkSlice";
import { TxType } from "../transactions/transactionsUtils";
import { SimpleFee } from "./feesUtils";

const feesCache: Record<string, SimpleFee> = {};
export const useFetchFees = (currency: BridgeCurrency, txType: TxType) => {
  const { provider, status } = useSelectedChainWallet();
  const network = useSelector($network);
  const initialFees: SimpleFee = {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  };
  const [fees, setFees] = useState(initialFees);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const cacheKey = `${currency}-${txType}`;
    if (provider && status === WalletStatus.CONNECTED) {
      if (feesCache[cacheKey]) {
        setFees(feesCache[cacheKey]);
        setPending(false);
      } else {
        const fetchFees =
          txType === TxType.MINT ? getLockAndMintFees : getBurnAndReleaseFees;
        fetchFees(currency, provider, network).then((feeRates) => {
          setPending(false);
          feesCache[cacheKey] = feeRates;
          setFees(feeRates);
        });
      }
    }
  }, [currency, provider, status, network, txType]);

  return { fees, pending };
};
