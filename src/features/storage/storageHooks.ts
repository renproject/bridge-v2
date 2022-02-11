// Source: https://usehooks.com/useLocalStorage/
import { Asset, Chain } from "@renproject/chains";
import { GatewayTransaction } from "@renproject/ren";
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
  const setValue = useCallback(
    (value: T | ((value: T) => T)) => {
      setStoredValue((oldValue) => {
        let valueToStore = oldValue;
        try {
          valueToStore = value instanceof Function ? value(oldValue) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error("Setting local value failed,", error);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
};

export type LocalTxData = {
  params: TransactionParams;
  done: boolean;
  timestamp: number;
};

export type RenVMHashTxsMap = {
  [renVMTxHash: string]: LocalTxData;
};

export type AddressTxsMap = {
  [web3Address: string]: RenVMHashTxsMap;
};

type GetLocalTxsForAddressFilterParams = {
  unfinished?: boolean;
  asset?: Asset | string;
  from?: Chain | string;
  to?: Chain | string;
};

export type LocalTxPersistor = (
  address: string,
  tx: GatewayTransaction,
  done?: boolean
) => void;

export const useTxsStorage = () => {
  const { network } = useSelector($network);
  const [localTxs, setLocalTxs] = useLocalStorage<AddressTxsMap>(
    `ren-bridge-v3:${network}:txs`,
    {}
  );
  // const [localTxsLoaded, setLocalTxsLoaded] = useState(false);
  // const [loadingLocalTxs, setLoadingLocalTxs] = useState(false);

  const persistLocalTx: LocalTxPersistor = useCallback(
    (web3Address: string, tx: GatewayTransaction, done = false) => {
      console.log("tx: persisting local tx", tx, done);
      setLocalTxs((txs) => ({
        ...txs,
        [web3Address]: {
          ...txs[web3Address],
          [tx.hash]: {
            params: tx.params,
            done,
            timestamp:
              ((txs[web3Address] || {})[tx.hash] || {}).timestamp || Date.now(),
          },
        },
      }));
    },
    [setLocalTxs]
  );

  const getLocalTxsForAddress = useCallback(
    (
      address: string,
      { unfinished = false, asset, to }: GetLocalTxsForAddressFilterParams
    ) => {
      const renVMHashTxsMap = localTxs[address];
      if (!renVMHashTxsMap) {
        return {};
      }
      let resultEntries = Object.entries(renVMHashTxsMap);
      if (unfinished) {
        resultEntries = resultEntries.filter(([hash, tx]) => !tx.done);
      }
      if (asset) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) => tx.params.asset === asset
        );
      }
      if (to) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) => tx.params.to.chain === to
        );
      }
      // TODO crit: add asset, chain filters
      return Object.fromEntries(resultEntries);
    },
    [localTxs]
  );

  return {
    localTxs,
    // setLocalTxs,
    persistLocalTx,
    getLocalTxsForAddress,
    // localTxsLoaded,
    // setLocalTxsLoaded,
    // loadingLocalTxs,
    // setLoadingLocalTxs,
  };
};

export type TxRemover = (txHash: string) => Promise<void>;
