import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  DepositMachineSchema,
  GatewaySession,
  mintMachine,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { env } from "../../constants/environmentVariables";
import { db } from "../../services/database/database";
import { DbGatewaySession } from "../../services/database/firebase/firebase";
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
  return useMachine(mintMachine, {
    context: {
      tx,
      providers,
      sdk: getRenJs(network),
      fromChainMap: lockChainMap,
      toChainMap: mintChainMap,
    },
    devTools: env.XSTATE_DEVTOOLS,
  });
};
export type DepositMachineSchemaState = keyof DepositMachineSchema["states"];

export enum DepositState {
  restoringDeposit = "restoringDeposit",
  errorRestoring = "errorRestoring",
  restoredDeposit = "restoredDeposit",
  srcSettling = "srcSettling",
  srcConfirmed = "srcConfirmed",
  accepted = "accepted",
  claiming = "claiming",
  errorSubmitting = "errorSubmitting",
  destInitiated = "destInitiated",
  completed = "completed",
  rejected = "rejected",
}

export const mintTxStateUpdateSequence = [
  DepositState.srcSettling,
  DepositState.srcConfirmed,
  DepositState.accepted,
  DepositState.destInitiated,
  DepositState.completed,
];
export const shouldUpdateMintTx = (
  tx: GatewaySession | DbGatewaySession,
  dbTx: DbGatewaySession,
  state: string
) => {
  // update when the new state is next in sequence
  // will prevent multiple updates in separate sessions
  const dbState = dbTx?.meta?.state;
  if (!dbState) {
    // update when no state
    return true;
  }
  const dbStateIndex = mintTxStateUpdateSequence.indexOf(
    dbState as DepositState
  );
  const stateIndex = mintTxStateUpdateSequence.indexOf(state as DepositState);
  if (stateIndex <= 0) {
    //dont update for srcSettling (updated during creation) or not supported states
    return false;
  }
  return stateIndex > dbStateIndex;
};

export const useMintTransactionPersistence = (
  tx: GatewaySession | DbGatewaySession,
  state: DepositMachineSchemaState
) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!state) {
      return;
    }
    db.getTx(tx)
      .then((dbTx) => {
        if (shouldUpdateMintTx(tx, dbTx, state)) {
          const newDbTx = { ...tx, meta: { state } };
          db.updateTx(newDbTx).then(() => {
            console.debug("mint updated", newDbTx, state);
            dispatch(updateTransaction(newDbTx));
          });
        }
      })
      .catch((err) => {
        console.warn("Mint Tx synchronization failed", err);
      });
  }, [dispatch, tx, state]);
};

export const useDepositPagination = (
  tx: GatewaySession,
  depositSourceHash = ""
) => {
  const sortedDeposits = Object.values(tx.transactions).sort(depositSorter);
  console.log("recalc", tx.transactions);
  const orderedHashes = sortedDeposits.map((deposit) => deposit.sourceTxHash);
  const total = orderedHashes.length;
  // TODO: FIXME: depositSourceHash may not be in tx object at the moment of resolving (machine is running),
  const initial = depositSourceHash || total > 0 ? orderedHashes[0] : "";
  console.log("initial", initial);
  const [currentHash, setCurrentHash] = useState(initial);
  useEffect(() => {
    setCurrentHash(initial);
  }, [initial]);
  console.log("currentHash", currentHash);

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
