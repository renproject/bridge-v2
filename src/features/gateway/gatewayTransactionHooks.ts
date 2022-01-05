import {
  ChainTransactionStatus,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import { useEffect, useState } from "react";

export const useChainTransactionStatusUpdater = (
  chainTransaction: TxSubmitter | TxWaiter,
  target?: number
) => {
  const [confirmations, setConfirmations] = useState<number>();
  const [status, setStatus] = useState<ChainTransactionStatus>();

  useEffect(() => {
    chainTransaction.wait(target).on("status", (transactionProgress) => {
      console.log("newStatus", transactionProgress);
      setConfirmations(transactionProgress.confirmations);
      setStatus(transactionProgress.status);
    });
  }, []);
  return { confirmations, status };
};
