import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  DepositMachineSchema,
  GatewaySession,
  mintMachine,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { env } from "../../constants/environmentVariables";
import { db } from "../../services/database/database";
import { DbGatewaySession } from "../../services/database/firebase/firebase";
import { getRenJs } from "../../services/renJs";
import { lockChainMap, mintChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { updateTransaction } from "../transactions/transactionsSlice";

export const useMintMachine = (mintTransaction: GatewaySession) => {
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
      tx: mintTransaction,
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
