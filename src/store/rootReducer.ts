import { combineReducers } from "@reduxjs/toolkit";
import { feesReducer } from "../features/fees/feesSlice";
import { flowReducer } from "../features/flow/flowSlice";
import { marketDataReducer } from "../features/marketData/marketDataSlice";
import { mintReducer } from "../features/mint/mintSlice";
import { walletReducer } from "../features/wallet/walletSlice";

const rootReducer = combineReducers({
  mint: mintReducer,
  flow: flowReducer,
  fees: feesReducer,
  marketData: marketDataReducer,
  wallet: walletReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
