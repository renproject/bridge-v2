import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GatewaySession } from "@renproject/ren-tx";
import { RootState } from "../../store/rootReducer";
import { getCurrencyRentxName } from "../../utils/assetConfigs";
import { $mint } from "../mint/mintSlice";
import {
  getLockAndMintParams,
  getSessionDay,
  getSessionExpiry,
} from "../mint/mintUtils";
import { $renNetwork } from "../network/networkSlice";
import { getBurnAndReleaseParams } from "../release/releaseUtils";
import { txCompletedSorter, TxEntryStatus, TxType } from "./transactionsUtils";

export type BridgeTransaction = GatewaySession;

type TransactionsState = {
  txs: Array<BridgeTransaction>;
  txsPending: boolean;
  txHistoryOpened: boolean;
  currentTxId: string;
};

let initialState: TransactionsState = {
  txs: [],
  txsPending: false,
  txHistoryOpened: false,
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
  setCurrentTxId,
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
export const $currentTxId = createSelector(
  $transactionsData,
  (transactions) => transactions.currentTxId
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

export const $currentSessionCount = createSelector(
  $networkTransactions,
  $mint,
  (txs, mint) => {
    const expiryTime = getSessionExpiry();
    return [...txs].filter(
      (x) =>
        x.sourceAsset == getCurrencyRentxName(mint.currency) &&
        x.type == "mint" &&
        x.expiryTime === expiryTime
    ).length;
  }
);

//TODO: move this one to separate file to simplify up store dependencies (chunks)
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
