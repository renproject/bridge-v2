import { combineReducers } from "@reduxjs/toolkit";
import { renDataReducer } from "../features/renData/renDataSlice";
import { marketDataReducer } from "../features/marketData/marketDataSlice";
import { mintReducer } from "../features/mint/mintSlice";
import { transactionsReducer } from '../features/transactions/transactionsSlice'
import { walletReducer } from "../features/wallet/walletSlice";

const rootReducer = combineReducers({
  mint: mintReducer,
  renData: renDataReducer,
  marketData: marketDataReducer,
  wallet: walletReducer,
  transactions: transactionsReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
