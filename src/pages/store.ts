import { ChainSymbols } from "../components/utils/types";
import { bridgeChainToMultiwalletChain } from "../providers/multiwallet/multiwalletUtils";
import { ExchangeRate } from "../services/marketData";

export type State = typeof initialState;
export type Action = {
  type: string;
  payload: any;
};

export type Reducer = (state: State, action: Action) => State;

export const initialState = {
  chain: bridgeChainToMultiwalletChain(ChainSymbols.ETHC),
  exchangeRates: [] as Array<ExchangeRate>,
};

export const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "setChain":
      return {
        ...state,
        chain: action.payload,
      };
    case "setExchangeRates":
      return {
        ...state,
        exchangeRates: action.payload,
      };
    default:
      return state;
  }
};
