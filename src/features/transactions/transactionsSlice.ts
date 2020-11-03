import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GatewaySession } from "@renproject/rentx";
import { RootState } from "../../store/rootReducer";

type Transaction = GatewaySession;

type TransactionsState = { txs: Array<Transaction> };

let initialState: TransactionsState = {
  txs: [],
};

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Array<Transaction>>) {
      state.txs = action.payload;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.txs.push(action.payload);
    },
    updateTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.txs[index] = action.payload;
      }
    },
    updateTransactionById(
      state,
      action: PayloadAction<{ id: string; transaction: Transaction }>
    ) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.txs[index] = action.payload.transaction;
      }
    },
    removeTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        delete state.txs[index];
      }
    },
  },
});

export const { setTransactions } = slice.actions;

export const transactionsReducer = slice.reducer;

export const $transactions = (state: RootState) => state.transactions;
export const $transactionList = createSelector(
  $transactions,
  (transactions) => transactions.txs
);
