import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

type TransactionsState = {
  txHistory: {
    dialogOpened: boolean;
  };
  currentTxId: string;
  currentSession: {
    txId: string;
    depositHash: string;
    data: any;
  };
  issueResolver: {
    dialogOpened: boolean;
  };
};

let initialState: TransactionsState = {
  txHistory: { dialogOpened: false },
  currentTxId: "",
  currentSession: {
    txId: "",
    depositHash: "",
    data: undefined,
  },
  issueResolver: {
    dialogOpened: false,
  },
};

const slice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTxHistoryOpened(state, action: PayloadAction<boolean>) {
      state.txHistory.dialogOpened = action.payload;
    },
    setIssueResolverOpened(state, action: PayloadAction<boolean>) {
      state.issueResolver.dialogOpened = action.payload;
    },
    // setCurrentTxId(state, action: PayloadAction<string>) {
    //   state.currentTxId = action.payload;
    // },
    // setCurrentSessionTxId(state, action: PayloadAction<string>) {
    //   state.currentSession.txId = action.payload;
    // },
    // setCurrentSessionDepositHash(state, action: PayloadAction<string>) {
    //   state.currentSession.depositHash = action.payload;
    // },
    // setCurrentSessionData(state, action: PayloadAction<any>) {
    //   state.currentSession.data = action.payload;
    // },
  },
});

export const {
  setTxHistoryOpened,
  // setCurrentTxId,
  // setIssueResolverOpened,
  // setCurrentSessionData,
  // setCurrentSessionDepositHash,
  // setCurrentSessionTxId,
} = slice.actions;

export const transactionsReducer = slice.reducer;

export const $transactions = (state: RootState) => state.transactions;

export const $txHistory = createSelector(
  $transactions,
  (transactions) => transactions.txHistory
);

export const $issueResolver = createSelector(
  $transactions,
  (transactions) => transactions.issueResolver
);
