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
  TransactionsHeader,
  TransactionsPaginationWrapper,
  TransactionsStatusHeader,
} from "../../components/transactions/TransactionsGrid";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { db } from "../../services/database/database";
import { $walletSignatures, $walletUser, setUser } from "../wallet/walletSlice";
import { MintTransactionEntryResolver } from "./components/TransactionsHelpers";
import {
  $transactions,
  $txHistoryOpened,
  BridgeTransaction,
  setTransactions,
  setTxHistoryOpened,
} from "./transactionsSlice";
import { TxType } from "./transactionsUtils";

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

  const all = txs.length;

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const itemsCount = all;
  const itemsPerPage = 4;

  return (
    <Dialog
      open={opened}
      maxWidth="sm"
      fullWidth
      onBackdropClick={handleClose}
      keepMounted
    >
      <TransactionsHeader title="Transactions" />
      <TransactionsStatusHeader title={`All (${all})`} />
      <div>
        {txs.map((tx) => {
          if (tx.type === TxType.MINT) {
            return <MintTransactionEntryResolver key={tx.id} tx={tx} />;
          } else {
            return <span>Release</span>;
          }
        })}
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
