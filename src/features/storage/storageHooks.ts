// Source: https://usehooks.com/useLocalStorage/
import { TransactionParams } from "@renproject/ren/build/main/gatewayTransaction";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { $network } from "../network/networkSlice";

const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((value: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export const useTransactionsStorage = () => {
  const { network } = useSelector($network);
  const [localTxs, setLocalTxs] = useLocalStorage<{
    [web3Address: string]: {
      [key: string]: {
        params: TransactionParams;
        done: boolean;
        timestamp: number;
      };
    };
  }>(`ren-bridge-v3:${network}:txs`, {});

  const [localTxsLoaded, setLocalTxsLoaded] = useState(false);
  const [loadingLocalTxs, setLoadingLocalTxs] = useState(false);

  const addLocalTx = useCallback(() => {}, [localTxs]);

  return {
    localTxs,
    setLocalTxs,
    localTxsLoaded,
    setLocalTxsLoaded,
    loadingLocalTxs,
    setLoadingLocalTxs,
  };
};