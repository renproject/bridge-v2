import { Chain } from "@renproject/chains";
import {
  ChainTransactionStatus,
  InputChainTransaction,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import { isDefined } from "../../utils/objects";
import { useCurrentNetworkChains } from "../network/networkHooks";
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
      console.log(l`tx: newStatus`, progress);
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
    console.log(l`tx: attaching listener`);
    tx.wait()
      .on("progress", trackProgress)
      .then(trackProgress)
      .catch((error) => {
        console.log(l`tx: error`, error.message);
        setError(error);
      });

    return () => {
      console.log(l`tx: detaching listener`);
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
      console.log(l`tx: newStatus`, progress);
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
    console.log(l`tx: attaching listener`);
    tx.wait()
      .on("progress", trackProgress)
      .then(trackProgress)
      .catch((error) => {
        console.log(l`tx: error`, error.message);
        // TODO: typical error message
        if (!error.message.includes(".submit")) {
          console.error(error);
          setError(error);
        }
      });
    return () => {
      console.log(l`tx: detaching listener`);
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
};

export const useChainTransactionSubmitter = ({
  tx,
  waitTarget = 1,
  autoSubmit = false,
  debugLabel = "",
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
    console.log(l`tx: waiting`);
    try {
      setWaiting(true);
      if (tx) {
        console.log(l`tx: waiting`);
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
    console.log(l`tx: submitting`);
    if (
      tx &&
      tx.submit &&
      tx.progress.status === ChainTransactionStatus.Ready
    ) {
      try {
        setSubmitting(true);
        await tx.submit({
          txConfig: {
            // gasLimit: 500000,
          },
        });
        setSubmittingDone(true);
        await wait();
        setDone(true);
      } catch (error: any) {
        console.error(l`tx: submitting error`, error);
        setErrorSubmitting(error);
      }
      setSubmitting(false);
    } else {
      console.error(l`tx: submitting error, tx not ready`);
      setErrorSubmitting(new Error("Submitting not ready"));
    }
  }, [l, wait, tx]);

  useEffect(() => {
    if (Boolean(autoSubmit)) {
      console.log(l`tx: automatic submit`);
      handleSubmit().catch((error) => {
        console.log(l`tx: automatic submit failed`);
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
  console.log("renVMHash param", renVMHash, params);
  if (renVMHash !== renVMHashParam) {
    console.log(
      "renVMHash param replacing",
      history.location.search,
      renVMHash
    );
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
  console.log("partialTx param", partialTx, params);
  if (partialTx !== partialTxParam) {
    console.log(
      "partialTx param replacing",
      history.location.search,
      partialTx
    );
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
