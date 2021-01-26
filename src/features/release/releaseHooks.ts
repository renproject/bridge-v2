import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  burnMachine,
  BurnMachineContext,
  BurnMachineEvent,
  BurnMachineSchema,
  GatewayMachineContext,
  GatewayMachineEvent,
  GatewaySession,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Interpreter, State } from "xstate";
import { env } from "../../constants/environmentVariables";
import { db } from "../../services/database/database";
import { DbGatewaySession } from "../../services/database/firebase/firebase";
import { getRenJs } from "../../services/renJs";
import { burnChainMap, releaseChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { updateTransaction } from "../transactions/transactionsSlice";
import { cloneTx } from "../transactions/transactionsUtils";

export type BurnMachineSchemaState = keyof BurnMachineSchema["states"];
export const useBurnMachine = (burnTransaction: GatewaySession) => {
  const tx = cloneTx(burnTransaction);
  const { enabledChains } = useMultiwallet();
  const network = useSelector($renNetwork);
  const providers = Object.entries(enabledChains).reduce(
    (c, n) => ({
      ...c,
      [n[0]]: n[1].provider,
    }),
    {}
  );
  return useMachine(burnMachine, {
    context: {
      tx,
      providers,
      sdk: getRenJs(network),
      fromChainMap: burnChainMap,
      toChainMap: releaseChainMap,
      // If we already have a transaction, we need to autoSubmit
      // to check the tx status
      autoSubmit: !!Object.values(burnTransaction.transactions)[0],
    },
    devTools: env.XSTATE_DEVTOOLS,
  });
};

export enum BurnState {
  restoring = "restoring",
  created = "created",
  createError = "createError",
  srcSettling = "srcSettling",
  srcConfirmed = "srcConfirmed",
  destInitiated = "destInitiated", // We only care if the txHash has been issued by renVM
}

export const releaseTxStateUpdateSequence = [
  BurnState.created,
  BurnState.srcSettling,
  BurnState.srcConfirmed,
  BurnState.destInitiated,
];
export const shouldUpdateReleaseTx = (
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
  const dbStateIndex = releaseTxStateUpdateSequence.indexOf(
    dbState as BurnState
  );
  const stateIndex = releaseTxStateUpdateSequence.indexOf(state as BurnState);
  if (stateIndex <= 0) {
    //dont update for created (updated during creation) or not supported states
    return false;
  }
  if (JSON.stringify(dbTx) === JSON.stringify(tx)) {
    return false;
  }
  return (
    stateIndex > dbStateIndex ||
    stateIndex === releaseTxStateUpdateSequence.length - 1
  );
};

export const useReleaseTransactionPersistence = (
  tx: GatewaySession | DbGatewaySession,
  state: BurnMachineSchemaState
) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!state) {
      return;
    }
    db.getTx(tx)
      .then((dbTx) => {
        if (shouldUpdateReleaseTx(tx, dbTx, state)) {
          const newDbTx = { ...tx, meta: { state } };
          db.updateTx(newDbTx).then(() => {
            dispatch(updateTransaction(newDbTx));
          });
        }
      })
      .catch((err) => {
        console.warn("Release Tx synchronization failed", err);
      });
  }, [dispatch, tx, state]);
};
//
// export const useNewReleaseTransactionPersistence = (
//   service: Interpreter<BurnMachineContext, any, BurnMachineEvent>
// ) => {
//   const dispatch = useDispatch();
//   const sub = useCallback(
//     async (state: State<BurnMachineContext, BurnMachineEvent>) => {
//       const tx = state.context.tx;
//       try {
//         // TODO: which event should we listen to?
//         if (
//           state.event.type === "CREATED" &&
//           state.value === "listening"
//         ) {
//           // no more meta status -
//           // this would not have worked with multiple deposits anyhow
//           // Also clone prevents throwing serialization errors during dispatch
//           // which breaks the event loop and prevents txs from processing
//           const newDbTx = cloneTx(tx);
//           await db.updateTx(newDbTx);
//           dispatch(updateTransaction(newDbTx));
//         }
//       } catch (err) {
//         console.warn("Release Tx synchronization failed", err, tx);
//       }
//     },
//     [dispatch]
//   );
//
//   useEffect(() => {
//     service.subscribe(sub);
//     return () => {
//       service.off(sub);
//     };
//   }, [dispatch, service, sub]);
//
//   service.subscribe();
// };
