import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GatewaySession } from "@renproject/ren-tx";
import { RootState } from "../../store/rootReducer";
import { getLockAndMintParams } from "../mint/mintUtils";
import { $renNetwork } from "../network/networkSlice";
import { getBurnAndReleaseParams } from "../release/releaseUtils";
import { txCompletedSorter, TxEntryStatus, TxType } from "./transactionsUtils";

export type BridgeTransaction = GatewaySession;

type TransactionsState = {
  txs: Array<BridgeTransaction>;
  txsPending: boolean;
  txHistoryOpened: boolean;
};

let initialState: TransactionsState = {
  txs: [],
  txsPending: false,
  txHistoryOpened: false,
};

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTxHistoryOpened(state, action: PayloadAction<boolean>) {
      state.txHistoryOpened = action.payload;
    },
    setTxsPending(state, action: PayloadAction<boolean>) {
      state.txsPending = action.payload;
    },
    setTransactions(state, action: PayloadAction<Array<BridgeTransaction>>) {
      state.txs = action.payload;
    },
    addTransaction(state, action: PayloadAction<BridgeTransaction>) {
      const existing =
        state.txs.findIndex((tx) => tx.id === action.payload.id) > -1;
      if (!existing) {
        state.txs.push(action.payload);
      }
    },
    updateTransaction(state, action: PayloadAction<BridgeTransaction>) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.txs[index] = action.payload;
      }
    },
    updateTransactionById(
      // TODO: optional
      state,
      action: PayloadAction<{ id: string; transaction: BridgeTransaction }>
    ) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.txs[index] = action.payload.transaction;
      }
    },
    removeTransaction(state, action: PayloadAction<BridgeTransaction>) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.txs.splice(index, 1);
      }
    },
  },
});

export const {
  setTxHistoryOpened,
  setTxsPending,
  setTransactions,
  addTransaction,
  updateTransaction,
  updateTransactionById,
  removeTransaction,
} = slice.actions;

export const transactionsReducer = slice.reducer;

export const $transactionsData = (state: RootState) => state.transactions;
export const $txHistoryOpened = createSelector(
  $transactionsData,
  (transactions) => transactions.txHistoryOpened
);

export const $networkTransactions = createSelector(
  $transactionsData,
  $renNetwork,
  (transactions, renNetwork) => {
    return transactions.txs.filter((tx) => tx.network === renNetwork);
  }
);
export const $orderedTransactions = createSelector(
  $networkTransactions,
  (txs) => [...txs].sort(txCompletedSorter)
);
export const $transactionsNeedsAction = createSelector(
  $networkTransactions,
  (txs) => {
    for (let tx of txs) {
      const { meta } =
        tx.type === TxType.MINT
          ? getLockAndMintParams(tx)
          : getBurnAndReleaseParams(tx);
      if (meta.status === TxEntryStatus.ACTION_REQUIRED) {
        return true;
      }
    }
    return false;
  }
);
