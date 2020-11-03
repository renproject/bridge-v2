import { Button } from "@material-ui/core";
import {
  DepositMachineSchema,
  GatewayTransaction,
  depositMachine,
} from "@renproject/rentx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actor } from "xstate";
import { Debug } from "../../../components/utils/Debug";
import { BridgeChain, BridgeCurrency } from "../../../components/utils/types";
import { useWallet } from "../../../providers/multiwallet/multiwalletHooks";
import {
  addTransaction,
  removeTransaction,
} from "../../transactions/transactionsSlice";
import { $multiwalletChain } from "../../wallet/walletSlice";
import { createMintTransaction, useMintMachine } from "../mintUtils";

export const DebugMintTransaction: FunctionComponent = () => {
  const dispatch = useDispatch();
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
  const canInitialize = tx.destAddress && tx.userAddress;
  const [current, , service] = useMintMachine(tx);

  // Clean up machine when component unmounts
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );

  const handleMint = useCallback(() => {
    // service.start();
    dispatch(addTransaction(tx));
  }, [dispatch, tx]);

  const handleDelete = useCallback(() => {
    dispatch(removeTransaction(tx));
  }, [dispatch, tx]);

  const activeDeposit = useMemo<{
    deposit: GatewayTransaction;
    machine: Actor<typeof depositMachine>;
  } | null>(() => {
    const deposit = Object.values(current.context.tx.transactions)[0];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    return { deposit, machine };
  }, [current.context]);

  return (
    <>
      <Debug it={{ tx }} />
      <Button onClick={handleMint} disabled={!canInitialize}>
        Add
      </Button>
      <Button onClick={handleDelete}>Remove</Button>
      {activeDeposit !== null && (
        <DepositStatus
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      )}
    </>
  );
};

const DepositStatus: React.FC<{
  deposit: GatewayTransaction;
  machine: Actor<typeof depositMachine>;
}> = ({ deposit, machine }) => {
  if (!machine) {
    return <div>Transaction completed</div>;
  }
  switch (machine.state.value as keyof DepositMachineSchema["states"]) {
    case "srcSettling":
      return (
        <div>
          Waiting for confirmations {deposit.sourceTxConfs} /{" "}
          {deposit.sourceTxConfTarget}
        </div>
      );
    case "srcConfirmed":
      return <div>Submitting to RenVM</div>;
    case "accepted":
      return (
        <div>
          Mint {deposit.sourceTxAmount / 1e8}{" "}
          {machine.state.context.tx.destAsset}?
        </div>
      );
    case "claiming":
      return <div>Signing mint transaction...</div>;
    case "destInitiated":
      return (
        <div>Your assets are on their way. TxHash: {deposit.destTxHash}</div>
      );
    default:
      return <div>loading...</div>;
  }
};
