import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GatewaySession } from "@renproject/ren-tx";
import { RootState } from "../../store/rootReducer";
import { getLockAndMintParams } from "../mint/mintUtils";
import { $renNetwork } from "../network/networkSlice";
import { getBurnAndReleaseParams } from "../release/releaseUtils";
import { TxEntryStatus, TxType } from "./transactionsUtils";

export type BridgeTransaction = GatewaySession;

type TransactionsState = {
  txs: Array<BridgeTransaction>;
  txsPending: boolean;
  txHistoryOpened: boolean;
  currentTxId: string; //FIXME: rename to MintTxGateway
};

let initialState: TransactionsState = {
  txs: [],
  txsPending: false, // FIXME: remove
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
export const $networkTransactions = createSelector(
  $transactionsData,
  $renNetwork,
  (transactions, renNetwork) => {
    return transactions.txs.filter((tx) => tx.network === renNetwork);
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
