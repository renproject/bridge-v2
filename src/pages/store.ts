import {
  ChainSymbols,
  FlowStep,
  TransactionKind,
} from "../components/utils/types";
import { bridgeChainToMultiwalletChain } from "../providers/multiwallet/multiwalletUtils";
import { ExchangeRate } from "../services/marketData";

export type Action = {
  type: string;
  payload: any;
};

type Flow = {
  kind: TransactionKind | undefined;
  step: FlowStep;
};

const initialFlow: Flow = {
  kind: TransactionKind.MINT,
  step: FlowStep.INITIAL,
};

export const initialState = {
  chain: bridgeChainToMultiwalletChain(ChainSymbols.ETHC),
  exchangeRates: [] as Array<ExchangeRate>,
  fees: {} as any, // TODO: change
  flow: initialFlow as Flow,
  transactionData: {} as any,
};

export type State = typeof initialState;

export type Reducer = (state: State, action: Action) => State;

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
    case "setFees":
      return {
        ...state,
        fees: action.payload,
      };
    case "setFlowStep":
      return {
        ...state,
        flow: {
          ...state.flow,
          step: action.payload,
        },
      };
    case "updateTransactionData":
      return {
        ...state,
        flow: {
          ...state.transactionData,
          ...action.payload,
        },
      };
    default:
      console.error("NotImplementedAction", action);
      return state;
  }
};
