import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

type TransactionsState = {
  txHistoryOpened: boolean;
  currentTxId: string;
};

let initialState: TransactionsState = {
  txHistoryOpened: true, // FIXME: false
  currentTxId: "",
};

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTxHistoryOpened(state, action: PayloadAction<boolean>) {
      state.txHistoryOpened = action.payload;
    },
    setCurrentTxId(state, action: PayloadAction<string>) {
      state.currentTxId = action.payload;
    },
  },
});

export const { setTxHistoryOpened, setCurrentTxId } = slice.actions;

export const transactionsReducer = slice.reducer;

export const $transactionsData = (state: RootState) => state.transactions;
export const $txHistoryOpened = createSelector(
  $transactionsData,
  (transactions) => transactions.txHistoryOpened
);
export const $currentTxId = createSelector(
  $transactionsData,
  (transactions) => transactions.currentTxId
);

