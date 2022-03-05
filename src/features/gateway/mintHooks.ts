import { GatewayTransaction } from "@renproject/ren/build/main/gatewayTransaction";
import { useCallback, useEffect, useState } from "react";

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
