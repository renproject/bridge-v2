import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/rootReducer";

type TransactionsState = {
  txHistory: {
    dialogOpened: boolean;
    showConnectedTxs: boolean;
  };
  txRecovery: {
    dialogOpened: boolean;
  };
  currentTxHash: string;
  issueResolver: {
    dialogOpened: boolean;
  };
};

let initialState: TransactionsState = {
  txHistory: {
    dialogOpened: false,
    showConnectedTxs: false,
  },
  txRecovery: {
    dialogOpened: false,
  },
  currentTxHash: "",
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
    setShowConnectedTxs(state, action: PayloadAction<boolean>) {
      state.txHistory.showConnectedTxs = action.payload;
    },
    setTxRecoveryOpened(state, action: PayloadAction<boolean>) {
      state.txRecovery.dialogOpened = action.payload;
    },
    setCurrentTxHash(state, action: PayloadAction<string>) {
      state.currentTxHash = action.payload;
    },
    setIssueResolverOpened(state, action: PayloadAction<boolean>) {
      state.issueResolver.dialogOpened = action.payload;
    },
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
  setTxRecoveryOpened,
  setShowConnectedTxs,
  setIssueResolverOpened,
  setCurrentTxHash,
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

export const $txRecovery = createSelector(
  $transactions,
  (transactions) => transactions.txRecovery
);

export const $issueResolver = createSelector(
  $transactions,
  (transactions) => transactions.issueResolver
);
