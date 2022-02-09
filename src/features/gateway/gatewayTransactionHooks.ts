import { Chain } from "@renproject/chains";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import {
  ChainTransactionStatus,
  InputChainTransaction,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isDefined } from "../../utils/objects";
import { useCurrentNetworkChains } from "../network/networkHooks";

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

  useEffect(() => {
    reset();
    if (!tx || !startTrigger) {
      return;
    }
    console.log(l`tx: attaching listener`);
    tx.wait(waitTarget)
      .on("progress", (progress) => {
        setError(null);
        console.log(l`tx: newStatus`, progress);
        setStatus(progress.status);
        setTarget(progress.target);

        if (isDefined(progress.transaction)) {
          setTxId(progress.transaction.txid);
          setTxIdFormatted(progress.transaction.txidFormatted);
          setTxIndex(progress.transaction.txindex);
          if (
            isDefined((progress.transaction as InputChainTransaction).amount)
          ) {
            setAmount((progress.transaction as InputChainTransaction).amount);
          }
        }
        const response = (progress as any).response as any; // RenVMTransactionWithStatus
        if (isDefined(response)) {
          if (isDefined(response.tx.out.amount)) {
            setAmount((response.tx.out.amount as BigNumber).toString());
          }
        }
      })
      .catch((reason) => {
        setError(reason);
      });

    return () => {
      console.log(l`tx: detaching listener`);
      //TODO: do
    };
  }, [l, waitTarget, tx, startTrigger, reset]);

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
  waitTarget,
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
    tx.wait(waitTarget)
      .on("progress", trackProgress)
      .catch((error) => {
        console.log(error.message);
        // TODO: typical error message
        if (!error.message.includes(".submit")) {
          console.error(error);
          setError(error);
        }
      });
    return () => {
      console.log(l`tx: detaching listener`);
      tx.eventEmitter.removeListener("progress", trackProgress); // TODO: same in useGateway?
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

export const useGatewayFirstTransaction = (gateway: Gateway) => {
  const [transaction, setTransaction] = useState<GatewayTransaction | null>(
    null
  );
  useEffect(() => {
    const getFirstTx = async () => {
      const tx = await gateway.transactions.first();
      if (tx) {
        setTransaction(tx);
      }
    };
    getFirstTx().finally();
  }, [gateway.transactions]);

  return transaction;
};

export const useChainTxState = () => {};

// deprecated
export const useChainTxHandlers = (
  tx?: TxSubmitter | TxWaiter,
  waitTarget?: number
) => {
  const [submitting, setSubmitting] = useState(false);
  const [submittingDone, setSubmittingDone] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [submittingError, setSubmittingError] = useState<Error>();
  const [waitingError, setWaitingError] = useState<Error>();
  const [waitingDone, setWaitingDone] = useState(false);

  const reset = useCallback(() => {
    setSubmitting(false);
    setWaiting(false);
    setSubmittingError(undefined);
    setWaitingError(undefined);
    setSubmittingDone(false);
    setWaitingDone(false);
  }, []);

  const wait = useCallback(async () => {
    setSubmittingError(undefined);
    setWaitingError(undefined);

    try {
      setWaiting(true);
      if (tx && submittingDone) {
        await tx.wait(waitTarget);
      } else {
        console.log(
          "Can't perform wait for tx: ",
          tx,
          tx?.wait,
          tx?.progress.status
        );
      }
      setWaitingDone(true);
    } catch (error: any) {
      console.error("xx", error);
      setWaitingError(error);
    }
    setWaiting(false);
  }, [tx, waitTarget, submittingDone]);

  const submit = useCallback(async () => {
    setSubmittingError(undefined);

    console.log("submitting");
    try {
      if (
        tx &&
        tx.submit &&
        tx.progress.status === ChainTransactionStatus.Ready
      ) {
        setSubmitting(true);
        await tx.submit({
          txConfig: {
            // gasLimit: 500000,
          },
        });
      } else {
        console.log(
          "Can't perform submit for tx: ",
          tx,
          tx?.submit,
          tx?.progress.status
        );
      }
    } catch (error: any) {
      console.error(error);
      setSubmittingError(error);
    }
    setSubmitting(false);
  }, [tx]);

  return {
    submit,
    submitting,
    submittingDone,
    submittingError,
    wait,
    waiting,
    waitingDone,
    waitingError,
    reset,
  };
};
