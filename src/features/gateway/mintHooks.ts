import { GatewayTransaction } from "@renproject/ren/build/main/gatewayTransaction";
import { useCallback, useEffect, useState } from "react";
import {
  DepositEntryStatus,
  DepositPhase,
} from "./components/MultipleDepositsHelpers";
import { useChainTransactionStatusUpdater } from "./gatewayTransactionHooks";

export const depositSorter = (a: any, b: any) => {
  const aConf = a.detectedAt || 0;
  const bConf = b.detectedAt || 0;
  return Number(aConf) - Number(bConf);
};

export const useTransactionsPagination = (
  transactions: Array<GatewayTransaction>,
  depositSourceHash = ""
) => {
  const sortedDeposits = transactions.sort(depositSorter);
  const orderedHashes = sortedDeposits.map((deposit) => deposit.hash);
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

export const getDepositTransactionMeta = (transaction: GatewayTransaction) => {
  const depositStatus = DepositEntryStatus.PENDING;
  const depositPhase = DepositPhase.LOCK;

  return { depositStatus, depositPhase };
};

export const useDepositTransactionMeta = (transaction: GatewayTransaction) => {
  const {
    error: lockError,
    status: lockStatus,
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    txId: lockTxId,
    txIdFormatted: lockTxIdFormatted,
    txIndex: lockTxIndex,
    txUrl: lockTxUrl,
    amount: lockAmount,
  } = useChainTransactionStatusUpdater(transaction.in);
  const {
    error: mintError,
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    txId: mintTxId,
    txIdFormatted: mintTxIdFormatted,
    txIndex: mintTxIndex,
    txUrl: mintTxUrl,
    amount: mintAmount,
  } = useChainTransactionStatusUpdater(transaction.out);

  return {
    lockError,
    lockStatus,
    lockConfirmations,
    lockTargetConfirmations,
    lockTxId,
    lockTxIdFormatted,
    lockTxIndex,
    lockTxUrl,
    lockAmount,
    mintError,
    mintStatus,
    mintConfirmations,
    mintTargetConfirmations,
    mintTxId,
    mintTxIdFormatted,
    mintTxIndex,
    mintTxUrl,
    mintAmount,
  };
};
