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
import { db } from "../../services/database/database";
import { BridgeChain } from "../../utils/assetConfigs";
import { $walletSignatures } from "../wallet/walletSlice";
import { $txHistoryOpened, setTxHistoryOpened } from "./transactionsSlice";

export const TransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { signature } = useSelector($walletSignatures);
  const opened = useSelector($txHistoryOpened);

  const fetchTxs = useCallback(() => {
    if (!signature) {
      return;
    }
    db.getTxs(signature).then((txs) => {
      console.log("txs", txs);
    });
  }, [signature]);

  useEffect(() => {
    fetchTxs();
  }, [fetchTxs]);

  const handleClose = useCallback(() => {
    dispatch(setTxHistoryOpened(false));
  }, [dispatch]);

  const pending = 3;
  const completed = 2;

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const itemsCount = 15;
  const itemsPerPage = 4;

  return (
    <Dialog open={opened} maxWidth="sm" fullWidth onBackdropClick={handleClose}>
      <TransactionsHeader title="Transactions" />
      <TransactionsStatusHeader title={`Pending (${pending})`} />
      <div>
        <TransactionEntry chain={BridgeChain.BSCC} status="submitted" />
      </div>
      <TransactionsStatusHeader title={`Completed (${completed})`} />
      <div>
        <TransactionEntry chain={BridgeChain.BSCC} status="completed" />
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
