import React, { createContext, FunctionComponent, useContext, useReducer, } from 'react'
import { initialState, Reducer, reducer, State } from '../pages/store'

export const StateContext = createContext<any>(undefined);

type StateProviderProps = {
  reducer: Reducer;
  initialState: State;
};

const StateContextProvider: FunctionComponent<StateProviderProps> = ({
  reducer,
  initialState,
  children,
}) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

export const StoreProvider: FunctionComponent = ({ children }) => (
  <StateContextProvider reducer={reducer} initialState={initialState}>
    {children}
  </StateContextProvider>
);

// type UseStore = () => [State, Dispatch<Action>];

export const useStore = () => useContext(StateContext);
