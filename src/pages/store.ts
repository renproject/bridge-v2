import { ChainSymbols } from "../components/utils/types";
import { bridgeChainToMultiwalletChain } from "../providers/multiwallet/multiwalletUtils";

export type State = typeof initialState;
export type Action = {
  type: string;
  payload: any;
};

export type Reducer = (state: State, action: Action) => State;

export const initialState = {
  chain: bridgeChainToMultiwalletChain(ChainSymbols.ETHC),
};

export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "setChain":
      return {
        ...state,
        chain: action.payload,
      };
    default:
      return state;
  }
};
