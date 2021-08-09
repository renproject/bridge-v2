import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  buildBurnContextWithMap,
  burnMachine,
  BurnMachineSchema,
  BurnSession,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import * as Sentry from "@sentry/react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { getBurnChainMap, releaseChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { cloneTx } from "../transactions/transactionsUtils";
import { useAsync } from "react-use";

export const useBurnMachine = (
  burnTransaction: BurnSession<any, any>,
  burnChainMap: any
) => {
  if (
    burnTransaction.transaction &&
    Object.keys(burnTransaction.transaction).length === 0
  ) {
    delete burnTransaction.transaction;
  }
  const tx = useMemo(() => {
    console.debug(burnTransaction);
    Sentry.captureMessage(JSON.stringify(burnTransaction));
    return cloneTx(burnTransaction);
  }, [burnTransaction]);
  const network = useSelector($renNetwork);

  return useMachine(
    burnChainMap.loading ? ({} as typeof burnMachine) : burnMachine,
    {
      context: {
        ...buildBurnContextWithMap({
          tx,
          sdk: getRenJs(network),
          fromChainMap: burnChainMap,
          toChainMap: releaseChainMap,
          // If we already have a transaction, we need to autoSubmit
          // to check the tx status
        }),
        autoSubmit: !!burnTransaction.transaction,
      },
      devTools: env.XSTATE_DEVTOOLS,
    }
  );
};

export type BurnMachineSchemaState = keyof BurnMachineSchema["states"];
