import { Chain } from "@renproject/chains";
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
  tx: TxSubmitter,
  waitTarget?: number
) => {
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<ChainTransactionStatus | null>();
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
    tx.wait(waitTarget)
      .once("progress", (progress) => {
        setError(null);
        console.log("newStatus", progress);
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
  }, [tx, waitTarget, reset]);

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
  tx: TxSubmitter | TxWaiter,
  waitTarget?: number
) => {
  const chains = useCurrentNetworkChains();
  const [error, setError] = useState<Error | null>(null);
  const [confirmations, setConfirmations] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [status, setStatus] = useState<ChainTransactionStatus | null>();
  const [txId, setTxId] = useState<string | null>(null);
  const [txIdFormatted, setTxIdFormatted] = useState<string | null>(null);
  const [txIndex, setTxIndex] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus(null);
    //TODO: add rest
  }, []);

  useEffect(() => {
    reset();
    tx.wait(waitTarget)
      .on("progress", (progress) => {
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
          if (
            isDefined((progress.transaction as InputChainTransaction).amount)
          ) {
            setAmount((progress.transaction as InputChainTransaction).amount);
          }
          const url = chains[tx.chain as Chain].chain.transactionExplorerLink(
            progress.transaction
          );
          if (url) {
            setTxUrl(url);
          }
        }
      })
      .catch((reason) => {
        setError(reason);
      });
  }, [tx, waitTarget, chains, reset]);
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