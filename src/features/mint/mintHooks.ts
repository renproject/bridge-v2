import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  DepositMachineSchema,
  GatewayMachineContext,
  GatewayMachineEvent,
  GatewaySession,
  mintMachine,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Interpreter, State } from "xstate";
import { env } from "../../constants/environmentVariables";
import { db } from "../../services/database/database";
import { getRenJs } from "../../services/renJs";
import { lockChainMap, mintChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { updateTransaction } from "../transactions/transactionsSlice";
import { cloneTx } from "../transactions/transactionsUtils";
import { depositSorter } from "./mintUtils";

export const useMintMachine = (mintTransaction: GatewaySession) => {
  const tx = cloneTx(mintTransaction);
  const { enabledChains } = useMultiwallet();
  const network = useSelector($renNetwork);
  const providers = Object.entries(enabledChains).reduce(
    (c, n) => ({
      ...c,
      [n[0]]: n[1].provider,
    }),
    {}
  );
  const machineHook = useMachine(mintMachine, {
    context: {
      tx,
      providers,
      sdk: getRenJs(network),
      fromChainMap: lockChainMap,
      toChainMap: mintChainMap,
    },
    devTools: env.XSTATE_DEVTOOLS,
  });

  useMintTransactionPersistence(machineHook[2]);

  return machineHook;
};

export type DepositMachineSchemaState = keyof DepositMachineSchema["states"];

export const useMintTransactionPersistence = (
  service: Interpreter<GatewayMachineContext, any, GatewayMachineEvent>
) => {
  const dispatch = useDispatch();
  const sub = useCallback(
    async (state: State<GatewayMachineContext, GatewayMachineEvent, any>) => {
      const tx = state.context.tx;
      try {
        // DEPOSIT_UPDATE should be a safe event to update the db on
        if (
          (state.event.type === "DEPOSIT_UPDATE" ||
            // We also persist on listening to catch the initial gateway
            state.event.type === "LISTENING") &&
          state.value === "listening"
        ) {
          // clone prevents throwing serialization errors during dispatch
          // which breaks the event loop and prevents txs from processing
          const newDbTx = cloneTx(tx);
          await db.updateTx(newDbTx);
          dispatch(updateTransaction(newDbTx));
        }
      } catch (err) {
        console.warn("Mint Tx synchronization failed", err, tx);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    service.subscribe(sub);
    return () => {
      service.off(sub);
    };
  }, [dispatch, service, sub]);

  service.subscribe();
};

export const useDepositPagination = (
  tx: GatewaySession,
  depositSourceHash = ""
) => {
  const sortedDeposits = Object.values(tx.transactions).sort(depositSorter);
  const orderedHashes = sortedDeposits.map((deposit) => deposit.sourceTxHash);
  const total = orderedHashes.length;
  const initial = depositSourceHash || total > 0 ? orderedHashes[0] : "";
  const [currentHash, setCurrentHash] = useState(initial);
  useEffect(() => {
    setCurrentHash(initial);
  }, [initial]);

  const currentIndex = orderedHashes.indexOf(currentHash);
  const nextIndex =
    total > 0 && currentIndex + 1 < total ? currentIndex + 1 : 0;
  const nextHash = orderedHashes[nextIndex];
  const prevIndex = total > 0 && currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
  const prevHash = orderedHashes[prevIndex];

  const handleNext = useCallback(() => {
    setCurrentHash(nextHash);
  }, [nextHash]);
  const handlePrev = useCallback(() => {
    setCurrentHash(prevHash);
  }, [prevHash]);
  return {
    currentHash,
    currentIndex,
    handleNext,
    handlePrev,
    total,
  };
};
