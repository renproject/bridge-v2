import { Button } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useSelector } from "react-redux";
import { Debug } from "../../../components/utils/Debug";
import { BridgeChain, BridgeCurrency } from "../../../components/utils/types";
import { useWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { $multiwalletChain } from "../../wallet/walletSlice";
import { createMintTransaction } from "../mintUtils";

export const DebugMintTransaction: FunctionComponent = () => {
  const multiwalletChain = useSelector($multiwalletChain);
  const { account } = useWallet(multiwalletChain);
  const tx = createMintTransaction({
    amount: 0.001,
    currency: BridgeCurrency.BTC,
    destAddress: account,
    mintedCurrencyChain: BridgeChain.ETHC,
    mintedCurrency: BridgeCurrency.RENBTC,
    userAddress: account,
  });

  const handleMint = useCallback(() => {}, []);
  return (
    <>
      <Debug it={tx} />
      <Button onClick={handleMint} />
    </>
  );
};
