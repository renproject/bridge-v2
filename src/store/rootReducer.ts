import { combineReducers } from "@reduxjs/toolkit";
import { gatewayReducer } from "../features/gateway/gatewaySlice";
import { networkReducer } from "../features/network/networkSlice";
import { marketDataReducer } from "../features/marketData/marketDataSlice";
import { transactionsReducer } from "../features/transactions/transactionsSlice";
import { uiReducer } from "../features/ui/uiSlice";
import { walletReducer } from "../features/wallet/walletSlice";

const rootReducer = combineReducers({
  ui: uiReducer,
  network: networkReducer,
  wallet: walletReducer,
  gateway: gatewayReducer,
  marketData: marketDataReducer,
  transactions: transactionsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
