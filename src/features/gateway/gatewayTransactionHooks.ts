import { Chain } from "@renproject/chains";
import {
  ChainTransactionStatus,
  InputChainTransaction,
  isDefined,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import { useEffect, useState } from "react";
import { useCurrentNetworkChains } from "../network/networkHooks";

export const useChainTransactionStatusUpdater = (
  tx: TxSubmitter | TxWaiter,
  waitTarget?: number
) => {
  const chains = useCurrentNetworkChains();
  const [error, setError] = useState<Error>();
  const [confirmations, setConfirmations] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [status, setStatus] = useState<ChainTransactionStatus>();
  const [txId, setTxId] = useState<string | null>(null);
  const [txIdFormatted, setTxIdFormatted] = useState<string | null>(null);
  const [txIndex, setTxIndex] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);

  useEffect(() => {
    tx.wait(waitTarget)
      .on("status", (progress) => {
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
  }, []); // TODO: fix deps
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

export const useChainAddressExplorerUrl = (
  chain: Chain | string,
  address: string
) => {
  const chains = useCurrentNetworkChains();
  const addressExplorerLink =
    chains[chain as Chain].chain.addressExplorerLink(address);
  return { addressExplorerLink };
};
