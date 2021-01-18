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
  isTestNetwork,
} from "../../utils/assetConfigs";
import { $renNetwork, setRenNetwork } from "../network/networkSlice";
import { useSelectedChainWallet } from '../wallet/walletHooks'
import { $wallet } from "../wallet/walletSlice";
import { removeTransaction } from "./transactionsSlice";
import { TxType } from "./transactionsUtils";

export const useTransactionDeletion = (tx: GatewaySession) => {
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
      showNotification(`Transaction ${tx.id} deleted.`);
      history.push(tx.type === TxType.MINT ? paths.MINT : paths.RELEASE);
    });
  }, [dispatch, history, showNotification, tx]);

  return { menuOpened, handleMenuOpen, handleMenuClose, handleDeleteTx };
};

export const useRenNetworkTracker = (currency: BridgeCurrency) => {
  const dispatch = useDispatch();
  const { chain } = useSelector($wallet);
  const renNetwork = useSelector($renNetwork);
  useEffect(() => {
    const currencyConfig = getCurrencyConfig(currency);
    // check if current network is testnet // TODO: do we need to check chain?
    if (isTestNetwork(renNetwork)) {
      const testNetwork =
        currencyConfig.testNetworkVersion || RenNetwork.Testnet;
      if (renNetwork !== testNetwork) {
        dispatch(setRenNetwork(testNetwork));
      }
    }
  }, [dispatch, chain, currency, renNetwork]);
};
