import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GatewaySession } from "@renproject/ren-tx";
import { RootState } from "../../store/rootReducer";

type BridgeTransaction = GatewaySession;

type TransactionsState = {
  txs: Array<BridgeTransaction>;
  currentTx: BridgeTransaction | null;
  txHistoryOpened: boolean;
};

let initialState: TransactionsState = {
  txs: [],
  currentTx: null,
  txHistoryOpened: false,
};

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTxHistoryOpened(state, action: PayloadAction<boolean>) {
      state.txHistoryOpened = action.payload;
    },
    setTransactions(state, action: PayloadAction<Array<BridgeTransaction>>) {
      state.txs = action.payload;
    },
    setCurrentTransaction(state, action: PayloadAction<BridgeTransaction>) {
      state.currentTx = action.payload;
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
  setTransactions,
  setCurrentTransaction,
  addTransaction,
  updateTransaction,
  updateTransactionById,
  removeTransaction,
} = slice.actions;

export const transactionsReducer = slice.reducer;

export const $transactions = (state: RootState) => state.transactions;
export const $txs = createSelector(
  $transactions,
  (transactions) => transactions.txs
);
export const $txHistoryOpened = createSelector(
  $transactions,
  (transactions) => transactions.txHistoryOpened
);
