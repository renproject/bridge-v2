import { Chain } from "@renproject/chains";
import { Gateway } from "@renproject/ren";
import {
  ChainTransactionStatus,
  InputChainTransaction,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import BigNumber from "bignumber.js";
import CancelablePromise, { cancelable } from "cancelable-promise";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import { useNotifications } from "../../providers/Notifications";
import { isDefined } from "../../utils/objects";
import { trimAddress } from "../../utils/strings";
import { sleep } from "../../utils/time";
import { useCurrentNetworkChains } from "../network/networkHooks";
import { useTxsStorage } from "../storage/storageHooks";
import { TxRecoverer } from "./gatewayHooks";
import { GatewayLocationState } from "./gatewayRoutingUtils";

export const useLabeler = (label: string) => {
  return useMemo(() => {
    return (strings: TemplateStringsArray) => `${label} ${strings}`;
  }, [label]);
};

type RenVMChainTransactionStatusUpdater = {
  tx?: TxSubmitter | TxWaiter;
  startTrigger?: boolean;
  waitTarget?: number;
  debugLabel?: string;
};
export const useRenVMChainTransactionStatusUpdater = ({
  tx,
  startTrigger = true,
  waitTarget, // TODO: 1 ?
  debugLabel = "renVM",
}: RenVMChainTransactionStatusUpdater) => {
  const l = useLabeler(debugLabel);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<ChainTransactionStatus | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [txIdFormatted, setTxIdFormatted] = useState<string | null>(null);
  const [txIndex, setTxIndex] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus(null);
    //TODO: add rest
  }, []);

  const trackProgress = useCallback(
    (progress) => {
      setError(null);
      console.info(l`tx: newStatus`, progress);
      setStatus(progress.status);
      setTarget(progress.target);

      if (isDefined(progress.transaction)) {
        setTxId(progress.transaction.txid);
        setTxIdFormatted(progress.transaction.txidFormatted);
        setTxIndex(progress.transaction.txindex);
        if (isDefined((progress.transaction as InputChainTransaction).amount)) {
          setAmount((progress.transaction as InputChainTransaction).amount);
        }
      }
      const response = (progress as any).response as any; // RenVMTransactionWithStatus
      if (isDefined(response)) {
        if (isDefined(response.tx.out.amount)) {
          setAmount((response.tx.out.amount as BigNumber).toString());
        }
      }
    },
    [l]
  );

  useEffect(() => {
    reset();
    if (!tx || !startTrigger) {
      return;
    }
    console.info(l`tx: attaching listener`);
    tx.wait()
      .on("progress", trackProgress)
      .then(trackProgress)
      .catch((error) => {
        console.info(l`tx: error`, error.message);
        setError(error);
      });

    return () => {
      console.info(l`tx: detaching listener`);
      tx.eventEmitter.removeListener("progress", trackProgress);
    };
  }, [l, trackProgress, waitTarget, tx, startTrigger, reset]);

  return {
    error,
    status,
    target,
    txId,
    txIdFormatted,
    txIndex,
    amount,
  };
};

type ChainTransactionStatusUpdater = {
  tx?: TxSubmitter | TxWaiter;
  startTrigger?: boolean;
  waitTarget?: number;
  debugLabel?: string;
};

export const useChainTransactionStatusUpdater = ({
  tx,
  startTrigger = true,
  waitTarget = 1,
  debugLabel = "",
}: ChainTransactionStatusUpdater) => {
  const l = useLabeler(debugLabel);
  const chains = useCurrentNetworkChains();
  const [error, setError] = useState<Error | null>(null);
  const [confirmations, setConfirmations] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [status, setStatus] = useState<ChainTransactionStatus | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [txIdFormatted, setTxIdFormatted] = useState<string | null>(null);
  const [txIndex, setTxIndex] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    // setStatus(null);
    //TODO: add rest
  }, []);

  const trackProgress = useCallback(
    (progress) => {
      setError(null);
      console.info(l`tx: newStatus`, progress);
      setStatus(progress.status);
      setTarget(progress.target);
      if (isDefined(progress.confirmations)) {
        setConfirmations(progress.confirmations);
      }
      if (isDefined(progress.transaction)) {
        setTxId(progress.transaction.txid);
        setTxIdFormatted(progress.transaction.txidFormatted);
        setTxIndex(progress.transaction.txindex);
        if (isDefined((progress.transaction as InputChainTransaction).amount)) {
          setAmount((progress.transaction as InputChainTransaction).amount);
        }
        const url = chains[
          progress.chain as Chain
        ].chain.transactionExplorerLink(progress.transaction);
        if (url) {
          setTxUrl(url);
        }
      }
    },
    [l, chains]
  );

  useEffect(() => {
    reset();
    if (!tx || !startTrigger) {
      return;
    }
    console.info(l`tx: attaching listener`);
    tx.wait()
      .on("progress", trackProgress)
      .then(trackProgress)
      .catch((error) => {
        console.info(l`tx: error`, error.message);
        // TODO: typical error message
        if (!error.message.includes(".submit")) {
          console.error(error);
          setError(error);
        }
      });
    return () => {
      console.info(l`tx: detaching listener`);
      tx.eventEmitter.removeListener("progress", trackProgress);
    };
  }, [l, trackProgress, tx, waitTarget, chains, reset, startTrigger]);

  return {
    error,
    status,
    target,
    confirmations,
    txId,
    txIdFormatted,
    txIndex,
    txUrl,
    amount,
  };
};

export const isTxSubmittable = (tx: TxSubmitter | TxWaiter | undefined) => {
  return tx && tx.submit && tx.progress.status === ChainTransactionStatus.Ready;
};

type ChainTransactionSubmitterParams = {
  tx?: TxSubmitter | TxWaiter;
  waitTarget?: number;
  autoSubmit?: boolean;
  debugLabel?: string;
  attempts?: number;
};

export const useChainTransactionSubmitter = ({
  tx,
  waitTarget = 1,
  autoSubmit = false,
  debugLabel = "",
  attempts = 1,
}: ChainTransactionSubmitterParams) => {
  const l = useLabeler(debugLabel);
  const [submitting, setSubmitting] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState<Error>();
  const [errorWaiting, setErrorWaiting] = useState<Error>();
  const [submittingDone, setSubmittingDone] = useState(false);
  const [waitingDone, setWaitingDone] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = useCallback(() => {
    setSubmitting(false);
    setWaiting(false);
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);
    setSubmittingDone(false);
    setWaitingDone(false);
    setDone(false);
  }, []);

  const wait = useCallback(async () => {
    setErrorWaiting(undefined);
    console.info(l`tx: waiting`);
    try {
      setWaiting(true);
      if (tx) {
        console.info(l`tx: waiting`);
        await tx.wait(waitTarget);
      } else {
        console.error(l`tx: waiting error, tx not ready`);
        setErrorWaiting(new Error(l`Waiting not ready`));
      }
    } catch (error: any) {
      console.error(l`tx: waiting error,`, error);
      setErrorWaiting(error);
    }
    setWaiting(false);
  }, [l, waitTarget, tx]);

  const handleSubmit = useCallback(async () => {
    setErrorSubmitting(undefined);
    console.info(l`tx: submitting`);
    if (
      tx &&
      tx.submit &&
      tx.progress.status === ChainTransactionStatus.Ready
    ) {
      for (let i = 0; i < attempts; i++) {
        try {
          setSubmitting(true);
          await tx.submit({
            txConfig: {
              // gasLimit: 500000,
            },
          });
          i = attempts;
          setSubmittingDone(true);
          await wait();
          setDone(true);
        } catch (error: any) {
          console.error(l`tx: submitting error`, error);
          setErrorSubmitting(error);
          if (attempts > 1) {
            // exponential backoff
            await sleep((i + 1) * 7000);
          }
        }
      }

      setSubmitting(false);
    } else {
      console.error(l`tx: submitting error, tx not ready`);
      setErrorSubmitting(new Error("Submitting not ready"));
    }
  }, [l, wait, tx, attempts]);

  useEffect(() => {
    if (Boolean(autoSubmit)) {
      console.info(l`tx: automatic submit`);
      handleSubmit().catch((error) => {
        console.info(l`tx: automatic submit failed`);
        console.error(error);
      });
    }
  }, [l, handleSubmit, autoSubmit, tx, tx?.submit, tx?.progress.status]);

  return {
    handleSubmit,
    errorSubmitting,
    errorWaiting,
    waiting,
    submitting,
    waitingDone,
    submittingDone,
    done,
    handleReset,
  };
};

export const updateRenVMHashParam = (
  history: RouteComponentProps["history"],
  renVMHash: string | null
) => {
  const params = new URLSearchParams(history.location.search);
  const renVMHashParam = (params as any).renVMHash;
  // console.log("renVMHash param", renVMHash, params);
  if (renVMHash !== renVMHashParam) {
    // console.log(
    //   "renVMHash param replacing",
    //   history.location.search,
    //   renVMHash
    // );
    if (renVMHash === null) {
      params.delete("renVMHash");
    } else {
      params.set("renVMHash", renVMHash);
    }
    history.replace({
      search: params.toString(),
    });
  }
};

export const reloadWithPartialTxParam = (
  history: RouteComponentProps["history"],
  partialTx: string | null,
  toAddress?: string
) => {
  const params = new URLSearchParams(history.location.search);
  const partialTxParam = (params as any).partialTx;
  // console.log("partialTx param", partialTx, params);
  if (partialTx !== partialTxParam) {
    // console.log(
    //   "partialTx param replacing",
    //   history.location.search,
    //   partialTx
    // );
    if (partialTx === null) {
      params.delete("partialTx");
    } else {
      // renVMHash should be deleted when retrieving with partialTx
      params.delete("renVMHash");
      params.set("partialTx", partialTx);
      if (toAddress) {
        params.set("toAddress", toAddress);
      }
    }
    const state: GatewayLocationState = {
      reload: true,
    };
    history.push(
      {
        search: params.toString(),
      },
      state
    );
  }
};

export const usePartialTxMemo = (partialTxString?: string | null) => {
  return useMemo(() => {
    if (partialTxString) {
      return JSON.parse(decodeURIComponent(partialTxString));
    }
    return null;
  }, [partialTxString]);
};

type UseTxRecoveryParams = {
  gateway: Gateway | null;
  recoveryMode: boolean;
  renVMHash?: string;
  fromAddress?: string;
  recoverLocalTx: TxRecoverer;
};

export const useTxRecovery = ({
  gateway,
  renVMHash,
  fromAddress,
  recoveryMode,
  recoverLocalTx,
}: UseTxRecoveryParams) => {
  const { showNotification } = useNotifications();
  // const [recoveryMode] = useState(hasRenVMHash || hasPartialTx);
  const [recoveringStarted, setRecoveringStarted] = useState(false);
  const [recoveringError, setRecoveringError] = useState<Error | null>(null);
  const { findLocalTx } = useTxsStorage();

  useEffect(() => {
    // TODO: add partialTx recovery notification
    if (
      recoveryMode &&
      renVMHash &&
      fromAddress &&
      gateway !== null &&
      !recoveringStarted
    ) {
      setRecoveringStarted(true);
      console.info("recovering tx: " + trimAddress(renVMHash));
      const localTx = findLocalTx(fromAddress, renVMHash);
      let cancelablePromise: CancelablePromise | null = null;
      if (localTx === null) {
        console.error(`Unable to find tx for ${fromAddress}, ${renVMHash}`);
        const message = `Transaction ${trimAddress(
          renVMHash
        )} for address: ${trimAddress(
          fromAddress
        )} not found in local storage.`;
        showNotification(message, {
          variant: "error",
        });
        setRecoveringError({
          code: 80404,
          message,
        } as any);
      } else {
        const recoverPromise = recoverLocalTx(renVMHash, localTx)
          .then(() => {
            showNotification(
              `Transaction ${trimAddress(renVMHash)} recovered.`,
              {
                variant: "success",
              }
            );
          })
          .catch((error) => {
            console.error(`Recovering error`, error.message);
            showNotification(`Failed to recover transaction`, {
              variant: "error",
            });
            setRecoveringError(error);
          });
        cancelablePromise = cancelable(recoverPromise);
      }
      return () => {
        if (cancelablePromise) {
          cancelablePromise.cancel();
        }
      };
    }
  }, [
    recoveryMode,
    showNotification,
    fromAddress,
    // toAddress,
    renVMHash,
    recoveringStarted,
    findLocalTx,
    gateway,
    recoverLocalTx,
  ]);

  return { recoveringError };
};
