import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GatewaySession } from "@renproject/ren-tx";
import { RootState } from "../../store/rootReducer";
import { txSorter } from "./transactionsUtils";

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
export const $orderedTransactions = createSelector(
  $transactionsData,
  (transactions) => [...transactions.txs].sort(txSorter)
);
export const $txHistoryOpened = createSelector(
  $transactionsData,
  (transactions) => transactions.txHistoryOpened
);
