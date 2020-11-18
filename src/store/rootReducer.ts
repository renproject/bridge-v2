import { combineReducers } from "@reduxjs/toolkit";
import { networkReducer } from "../features/network/networkSlice";
import { releaseReducer } from "../features/release/releaseSlice";
import { marketDataReducer } from "../features/marketData/marketDataSlice";
import { mintReducer } from "../features/mint/mintSlice";
import { transactionsReducer } from "../features/transactions/transactionsSlice";
import { walletReducer } from "../features/wallet/walletSlice";

const rootReducer = combineReducers({
  network: networkReducer,
  wallet: walletReducer,
  mint: mintReducer,
  release: releaseReducer,
  marketData: marketDataReducer,
  transactions: transactionsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
