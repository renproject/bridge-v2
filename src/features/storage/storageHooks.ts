// Source: https://usehooks.com/useLocalStorage/
import { Asset, Chain } from "@renproject/chains";
import { GatewayTransaction } from "@renproject/ren";
import { TransactionParams } from "@renproject/ren/build/module/params";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNotifications } from "../../providers/Notifications";
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

export type LocalTxMeta = {
  expiryTime?: number;
};

export type LocalTxData = {
  params: TransactionParams;
  done: boolean;
  timestamp: number;
  address: string;
  meta?: LocalTxMeta;
};

export type RenVMHashTxsMap = {
  [renVMTxHash: string]: LocalTxData;
};

export type AddressTxsMap = {
  [web3Address: string]: RenVMHashTxsMap;
};

type GetLocalTxsForAddressFilterParams = {
  done?: boolean;
  asset?: Asset | string;
  address?: string;
  chain?: Chain | string;
  from?: Chain | string;
  to?: Chain | string;
};

export type LocalTxPersistor = (
  address: string,
  tx: GatewayTransaction,
  done?: boolean,
  meta?: LocalTxMeta
) => void;

export type LocalTxRemover = (address: string, renVMTxHash: string) => void;

export const useTxsStorage = () => {
  const { network } = useSelector($network);
  const [localTxs, setLocalTxs] = useLocalStorage<AddressTxsMap>(
    `ren-bridge-v3:${network}:txs`,
    {}
  );
  // const [localTxsLoaded, setLocalTxsLoaded] = useState(false);
  // const [loadingLocalTxs, setLoadingLocalTxs] = useState(false);

  const findLocalTx = useCallback(
    (address: string, renVMHash: string) => {
      const renVMHashTxsMap = localTxs[address];
      if (!renVMHashTxsMap) {
        return null;
      }
      const resultEntry = Object.entries(renVMHashTxsMap).find(
        ([hash]) => hash === renVMHash
      );
      return resultEntry ? resultEntry[1] : null;
    },
    [localTxs]
  );

  const isLocalTxDone = useCallback(
    (address: string, renVMHash: string) => {
      const actual = findLocalTx(address, renVMHash);
      if (actual !== null && actual.done) {
        return true;
      }
      return false;
    },
    [findLocalTx]
  );

  const { showNotification } = useNotifications();
  const persistLocalTx: LocalTxPersistor = useCallback(
    (web3Address, tx, done = false, meta) => {
      console.info("tx: persisting local tx", web3Address, tx, done);
      if (!web3Address) {
        console.warn("Unable to persist tx, no address", web3Address);
        return;
      }
      if (!tx.hash) {
        console.warn("Unable to persist tx, no tx.hash", tx);
        return;
      }

      setLocalTxs((txs) => {
        const empty = {};
        const current = (txs[web3Address] || {})[tx.hash] || empty;
        if (current === empty) {
          showNotification(
            "Bookmark this page to ensure you don't lose track of your transaction. Doing so will help keep your funds safe.",
            { variant: "info" }
          );
        }
        // don't overwrite done transactions;
        if (current.done) {
          return txs;
        }

        return {
          ...txs,
          [web3Address]: {
            ...txs[web3Address],
            [tx.hash]: {
              params: tx.params,
              done,
              meta, // add spreading when more params occur in meta
              address: current.address || web3Address,
              timestamp: current.timestamp || Date.now(),
            },
          },
        };
      });
    },
    [setLocalTxs, showNotification]
  );

  const removeLocalTx: LocalTxRemover = useCallback(
    (web3Address: string, renVMHash: string) => {
      setLocalTxs((txs) => {
        console.log(txs);
        const { [web3Address]: addressTxs, ...otherAddressEntries } = txs;
        const { [renVMHash]: toDelete, ...otherRenVMHashEntries } = addressTxs;
        return { ...otherAddressEntries, [web3Address]: otherRenVMHashEntries };
      });
    },
    [setLocalTxs]
  );

  const getAllLocalTxs = useCallback(
    ({
      done,
      asset,
      chain,
      address,
      to,
      from,
    }: GetLocalTxsForAddressFilterParams) => {
      const allTxs: Record<string, LocalTxData> = {};

      Object.entries(localTxs).forEach(([addressKey, entry]) => {
        Object.entries(entry).forEach(([renVMHash, tx]) => {
          allTxs[renVMHash] = { ...tx, address: addressKey };
        });
      });

      let resultEntries = Object.entries(allTxs);

      resultEntries = resultEntries.filter(
        ([hash, tx]) => hash !== "undefined" && tx.params !== undefined
      );

      if (done !== undefined) {
        resultEntries = resultEntries.filter(([hash, tx]) => tx.done === done);
      }
      if (asset) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) => tx.params?.asset === asset
        );
      }

      // specific address
      if (address) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) =>
            tx.address === address ||
            (tx.params?.to as any)?.params?.address === address
        );
      }

      // any chain
      if (chain) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) =>
            tx.params?.fromTx?.chain === chain || tx.params?.to?.chain === chain
        );
      }

      //specific chains
      if (from) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) => tx.params?.fromTx?.chain === from
        );
      }
      if (to) {
        resultEntries = resultEntries.filter(
          ([hash, tx]) => tx.params?.to?.chain === to
        );
      }
      return Object.fromEntries(resultEntries);
    },
    [localTxs]
  );

  return {
    localTxs,
    // setLocalTxs,
    persistLocalTx,
    removeLocalTx,
    getAllLocalTxs,
    findLocalTx,
    isLocalTxDone,
    // localTxsLoaded,
    // setLocalTxsLoaded,
    // loadingLocalTxs,
    // setLoadingLocalTxs,
  };
};
