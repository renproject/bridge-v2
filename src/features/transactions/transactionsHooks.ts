import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession } from "@renproject/ren-tx";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { paths } from "../../pages/routes";
import { useNotifications } from "../../providers/Notifications";
import { db } from "../../services/database/database";
import {
  BridgeCurrency,
  getCurrencyConfig,
  isMainnetNetwork,
  isTestnetNetwork,
} from "../../utils/assetConfigs";
import { trimAddress } from '../../utils/strings'
import { $renNetwork, setRenNetwork } from "../network/networkSlice";
import { useSelectedChainWallet } from "../wallet/walletHooks";
import { $multiwalletChain } from "../wallet/walletSlice";
import {
  $currentTxId,
  removeTransaction,
  setCurrentTxId,
} from "./transactionsSlice";
import { TxType } from "./transactionsUtils";

export const useTransactionMenuControl = (tx: GatewaySession) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { showNotification } = useNotifications();
  const { walletConnected } = useSelectedChainWallet();

  const [menuOpened, setMenuOpened] = useState(false);
  const handleMenuClose = useCallback(() => {
    setMenuOpened(false);
  }, []);
  const handleMenuOpen = useCallback(() => {
    if (walletConnected) {
      setMenuOpened(true);
    }
  }, [walletConnected]);
  const handleDeleteTx = useCallback(() => {
    db.deleteTx(tx).then(() => {
      dispatch(removeTransaction(tx));
      showNotification(`Transaction ${trimAddress(tx.id, 6)} deleted.`);
      history.push(tx.type === TxType.MINT ? paths.MINT : paths.RELEASE);
    });
  }, [dispatch, history, showNotification, tx]);

  return { menuOpened, handleMenuOpen, handleMenuClose, handleDeleteTx };
};

export const useRenNetworkTracker = (currency: BridgeCurrency) => {
  const dispatch = useDispatch();
  const renChain = useSelector($multiwalletChain);
  const renNetwork = useSelector($renNetwork);
  useEffect(() => {
    const currencyConfig = getCurrencyConfig(currency);
    const networkMapping = currencyConfig.networkMappings[renChain];
    let newNetwork: RenNetwork | null = null;
    if (isTestnetNetwork(renNetwork)) {
      newNetwork = networkMapping.testnet;
    } else if (isMainnetNetwork(renNetwork)) {
      newNetwork = networkMapping.mainnet;
    } else {
      console.error(`Unknown network ${newNetwork}`);
    }
    if (newNetwork && renNetwork !== newNetwork) {
      dispatch(setRenNetwork(newNetwork));
    }
  }, [dispatch, renChain, currency, renNetwork]);
};

export const useSetCurrentTxId = (id: string) => {
  const dispatch = useDispatch();
  const currentId = useSelector($currentTxId);
  useEffect(() => {
    if (id !== currentId) {
      dispatch(setCurrentTxId(id));
    }
  }, [dispatch, id, currentId]);
};
