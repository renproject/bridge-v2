import { Dialog } from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { SimplePagination } from "../../components/pagination/SimplePagination";
import {
  TransactionEntry,
  TransactionsHeader,
  TransactionsPaginationWrapper,
  TransactionsStatusHeader,
} from "../../components/transactions/TransactionsGrid";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { db } from "../../services/database/database";
import { BridgeChain } from "../../utils/assetConfigs";
import { $walletSignatures, $walletUser, setUser } from "../wallet/walletSlice";
import {
  MintTransactionEntry,
  MintTransactionEntryResolver,
} from "./components/TransactionsHelpers";
import {
  $transactions,
  $txHistoryOpened,
  BridgeTransaction,
  setTransactions,
  setTxHistoryOpened,
} from "./transactionsSlice";
import { TxEntryStatus, TxType } from "./transactionsUtils";

export const TransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { account } = useSelectedChainWallet();
  const user = useSelector($walletUser);
  const txs = useSelector($transactions);
  const { signature, rawSignature } = useSelector($walletSignatures);
  const opened = useSelector($txHistoryOpened);

  useEffect(() => {
    if (account && signature && rawSignature) {
      console.log("getting user");
      db.getUser(account.toLowerCase(), {
        signature,
        rawSignature,
      })
        .then((userData) => {
          console.log("authenticated", userData);
          dispatch(setUser(userData));
        })
        .catch(console.error);
    }
  }, [dispatch, account, signature, rawSignature]);

  useEffect(() => {
    if (user) {
      db.getTxs(signature).then((txsData) => {
        dispatch(setTransactions(txsData as Array<BridgeTransaction>));
      });
    }
  }, [dispatch, user, signature]);

  const handleClose = useCallback(() => {
    dispatch(setTxHistoryOpened(false));
  }, [dispatch]);

  const pending = 3;

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const itemsCount = 15;
  const itemsPerPage = 4;

  return (
    <Dialog open={opened} maxWidth="sm" fullWidth onBackdropClick={handleClose}>
      <TransactionsHeader title="Transactions" />
      <TransactionsStatusHeader title={`All (${pending})`} />
      <div>
        {txs.map((tx) => {
          if (tx.type === TxType.MINT) {
            return <MintTransactionEntryResolver tx={tx} />;
          } else {
            return <span>Release</span>;
          }
        })}
      </div>
      <TransactionsStatusHeader title={`Completed (${pending})`} />
      <div>
        <TransactionEntry
          chain={BridgeChain.BSCC}
          status={TxEntryStatus.COMPLETED}
        />
      </div>

      <TransactionsPaginationWrapper>
        <SimplePagination
          count={itemsCount}
          rowsPerPage={itemsPerPage}
          page={page}
          onChangePage={handleChangePage}
        />
      </TransactionsPaginationWrapper>
    </Dialog>
  );
};
