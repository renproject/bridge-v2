import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  burnMachine,
  BurnMachineContext,
  BurnMachineEvent,
  BurnMachineSchema,
  GatewaySession,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Interpreter, State } from "xstate";
import { env } from "../../constants/environmentVariables";
import { db } from "../../services/database/database";
import { getRenJs } from "../../services/renJs";
import { burnChainMap, releaseChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { updateTransaction } from "../transactions/transactionsSlice";
import { cloneTx } from "../transactions/transactionsUtils";

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
  const machineHook = useMachine(burnMachine, {
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

  useReleaseTransactionPersistence(machineHook[2]);

  return machineHook;
};

export type BurnMachineSchemaState = keyof BurnMachineSchema["states"];

export const useReleaseTransactionPersistence = (
  service: Interpreter<BurnMachineContext, any, BurnMachineEvent>
) => {
  const dispatch = useDispatch();
  const sub = useCallback(
    async (state: State<BurnMachineContext, BurnMachineEvent>) => {
      const tx = state.context.tx;
      try {
        // TODO: which event should we listen to?
        if (
          state.value === "listening" &&
          (state.event.type === "CREATED" || state.event.type === "RELEASED")
        ) {
          // Clone prevents throwing serialization errors during dispatch
          // which breaks the event loop and prevents txs from processing
          const newDbTx = cloneTx(tx);
          await db.updateTx(newDbTx);
          dispatch(updateTransaction(newDbTx));
        }
      } catch (err) {
        console.warn("Release Tx synchronization failed", err, tx);
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
