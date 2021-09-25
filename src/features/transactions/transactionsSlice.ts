import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

type TransactionsState = {
  txHistoryOpened: boolean;
  currentTxId: string; // TODO: crit: deprecated
  currentSession: {
    txId: string;
    data: any;
  };
  issueResolver: {
    dialogOpened: boolean;
  };
};

let initialState: TransactionsState = {
  txHistoryOpened: false,
  currentTxId: "",
  currentSession: {
    txId: "",
    data: undefined,
  },
  issueResolver: {
    dialogOpened: true,
  },
};

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTxHistoryOpened(state, action: PayloadAction<boolean>) {
      state.txHistoryOpened = action.payload;
    },
    setIssueResolverOpened(state, action: PayloadAction<boolean>) {
      state.issueResolver.dialogOpened = action.payload;
    },
    setCurrentTxId(state, action: PayloadAction<string>) {
      state.currentTxId = action.payload;
    },
    setCurrentSessionTxId(state, action: PayloadAction<string>) {
      state.currentSession.txId = action.payload;
    },
    setCurrentSessionData(state, action: PayloadAction<any>) {
      state.currentSession.data = action.payload;
    },
  },
});

export const {
  setTxHistoryOpened,
  setCurrentTxId,
  setIssueResolverOpened,
  setCurrentSessionData,
  setCurrentSessionTxId,
} = slice.actions;

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

export const $issueResolver = createSelector(
  $transactionsData,
  (transactions) => transactions.issueResolver
);

export const $currentSession = createSelector(
  $transactionsData,
  (transactions) => transactions.currentSession
);
