import { Chain } from "@renproject/chains";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import {
  ChainTransactionStatus,
  InputChainTransaction,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";
import { isDefined } from "../../utils/objects";
import { useCurrentNetworkChains } from "../network/networkHooks";

export const useRenVMChainTransactionStatusUpdater = (
  tx?: TxSubmitter,
  start = true,
  waitTarget?: number
) => {
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
    if (!tx || !start) {
      return;
    }
    tx.wait(waitTarget)
      .once("progress", (progress) => {
        setError(null);
        console.log("newStatus renvm", progress);
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
    // TODO add teardown
  }, [tx, waitTarget, reset, start]);

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

export const useChainTransactionStatusUpdater = (
  tx?: TxSubmitter | TxWaiter,
  start = true,
  waitTarget?: number
) => {
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
      console.log("newStatus", progress);
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
    [chains]
  );
  useEffect(() => {
    reset();
    if (!tx || !start) {
      return;
    }
    tx.wait(waitTarget)
      .on("progress", trackProgress)
      .catch((reason) => {
        console.error(reason);
        setError(reason);
      });
    return () => {
      tx.eventEmitter.removeListener("progress", trackProgress);
    };
  }, [trackProgress, tx, waitTarget, chains, reset, start]);
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

export const useChainTransactionSubmitter = (
  tx?: TxSubmitter | TxWaiter,
  waitTarget?: number,
  autoSubmit?: boolean
) => {
  const [submitting, setSubmitting] = useState(!!autoSubmit);
  const [waiting, setWaiting] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState<Error>();
  const [errorWaiting, setErrorWaiting] = useState<Error>();
  const [done, setDone] = useState(false);

  const handleReset = useCallback(() => {
    setSubmitting(!!autoSubmit);
    setWaiting(false);
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);
    setDone(false);
  }, [autoSubmit]);

  const wait = useCallback(async () => {
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);

    try {
      setWaiting(true);
      if (tx) {
        await tx.wait(waitTarget);
      }
      setDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorWaiting(error);
    }
    setWaiting(false);
  }, [tx, waitTarget]);

  const handleSubmit = useCallback(async () => {
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);

    console.log("submitting");
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
        await wait();
      } catch (error: any) {
        console.error("yy", error);
        setErrorSubmitting(error);
      }
      setSubmitting(false);
    }
  }, [tx, wait]);

  return {
    handleSubmit,
    errorSubmitting,
    errorWaiting,
    waiting,
    submitting,
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
  }, [tx, wait]);

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
