import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  buildMintContextWithMap,
  DepositMachineSchema,
  GatewayMachineContext,
  GatewaySession,
  mintMachine,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useInterval } from "react-use";
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { getMintChainMap, lockChainMap } from "../../services/rentx";
import { $renNetwork } from "../network/networkSlice";
import { cloneTx } from "../transactions/transactionsUtils";
import { depositSorter } from "./mintUtils";

export const useMintMachine = (mintTransaction: GatewaySession<any>) => {
  const tx = cloneTx(mintTransaction);
  const { enabledChains } = useMultiwallet();
  const network = useSelector($renNetwork);
  const mintChainMap = useMemo(() => {
    const providers = Object.entries(enabledChains).reduce(
      (c, n) => ({
        ...c,
        [n[0]]: n[1].provider,
      }),
      {}
    );
    return getMintChainMap(providers);
  }, [enabledChains]);

  return useMachine(mintMachine, {
    context: {
      ...buildMintContextWithMap({
        tx,
        // providers,
        sdk: getRenJs(network),
        fromChainMap: lockChainMap,
        toChainMap: mintChainMap,
      }),
    },
    autoSubmit: true,
    devTools: env.XSTATE_DEVTOOLS,
  });
};

export type DepositMachineSchemaState = keyof DepositMachineSchema<any>["states"];

export const useDepositPagination = (
  tx: GatewaySession<any>,
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
    orderedHashes,
    currentIndex,
    handleNext,
    handlePrev,
    total,
  };
};

/**
 * Will rerender component every intervalMs, producing new ms value
 */

export const useIntervalCountdown = (
  countFromMs: number,
  intervalMs = 1000
) => {
  const [ms, setMs] = useState(countFromMs);
  useInterval(() => {
    setMs(ms - intervalMs);
  }, intervalMs);
  return ms;
};
