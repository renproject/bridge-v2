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
      console.log('aaaaaa');
      const existing =
        state.txs.findIndex((tx) => tx.id === action.payload.id) > -1;
      if (!existing) {
        state.txs.push(action.payload);
      }
    },
    updateTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.txs.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.txs[index] = action.payload;
      }
    },
    updateTransactionById(
      // TODO: optional
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
        state.txs.splice(index, 1);
      }
    },
  },
});

export const {
  setTransactions,
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

// export const $currentTx = createSelector($txs, $currentTxId, (txs, id) =>
//   txs.find((tx) => tx.id === id)
// );
