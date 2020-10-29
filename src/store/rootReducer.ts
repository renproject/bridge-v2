import { combineReducers } from "@reduxjs/toolkit";
import { feesReducer } from "../features/fees/feesSlice";
import { flowReducer } from "../features/flow/flowSlice";
import { mintReducer } from "../features/mint/mintSlice";

const rootReducer = combineReducers({
  mint: mintReducer,
  flow: flowReducer,
  fees: feesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
