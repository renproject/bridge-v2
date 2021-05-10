import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  buildBurnContextWithMap,
  burnMachine,
  BurnMachineSchema,
  BurnSession,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { getBurnChainMap, releaseChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { cloneTx } from "../transactions/transactionsUtils";

export const useBurnMachine = (burnTransaction: BurnSession<any, any>) => {
  const tx = cloneTx(burnTransaction);
  const { enabledChains } = useMultiwallet();
  const network = useSelector($renNetwork);
  const burnChainMap = useMemo(() => {
    const providers = Object.entries(enabledChains).reduce(
      (c, n) => ({
        ...c,
        [n[0]]: n[1].provider,
      }),
      {}
    );
    return getBurnChainMap(providers);
  }, [enabledChains]);

  return useMachine(burnMachine, {
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
  });
};

export type BurnMachineSchemaState = keyof BurnMachineSchema["states"];
