import { Button } from "@material-ui/core";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  depositMachine,
  DepositMachineSchema,
  GatewaySession,
  GatewayTransaction,
} from "@renproject/rentx";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actor } from "xstate";
import { Debug } from "../../../components/utils/Debug";
import { BridgeChain, BridgeCurrency } from "../../../components/utils/types";
import { useWallet } from "../../../providers/multiwallet/multiwalletHooks";
import {
  $currentTx,
  addTransaction,
  removeTransaction,
  setCurrentTransaction,
} from "../../transactions/transactionsSlice";
import { $multiwalletChain } from "../../wallet/walletSlice";
import { createMintTransaction, useMintMachine } from "../mintUtils";

export const MintExample: FunctionComponent = () => {
  const dispatch = useDispatch();
  const multiwalletChain = useSelector($multiwalletChain);
  const { account, status } = useWallet(multiwalletChain);
  const userAddress = account;
  const destAddress = account;
  const tx = useSelector($currentTx);

  const walletNotOK = !(userAddress && destAddress) || status !== "connected";

  const handleMint = useCallback(() => {
    const tx = createMintTransaction({
      amount: 0.001,
      currency: BridgeCurrency.BTC,
      destAddress: destAddress,
      mintedCurrencyChain: BridgeChain.ETHC,
      mintedCurrency: BridgeCurrency.RENBTC,
      userAddress: userAddress,
    });
    dispatch(addTransaction(tx));
    dispatch(setCurrentTransaction(tx));
  }, [dispatch, destAddress, userAddress]);

  const handleDelete = useCallback(() => {
    if (tx !== null) {
      dispatch(removeTransaction(tx));
    }
  }, [dispatch, tx]);

  return (
    <>
      <Debug it={{ tx }} />
      <Button onClick={handleMint} disabled={walletNotOK}>
        {walletNotOK ? "Connect Wallet" : "Add"}
      </Button>
      <Button onClick={handleDelete}>Remove</Button>
      {tx !== null && <TransactionDataGuard tx={{ ...tx }} />}
    </>
  );
};

type MintTransactionInfoProps = {
  tx: GatewaySession;
};

export const TransactionDataGuard: FunctionComponent<MintTransactionInfoProps> = ({
  tx,
  children,
}) => {
  const { enabledChains } = useMultiwallet();
  const [current] = useMintMachine(tx);

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
      <Debug it={enabledChains} />
      {activeDeposit ? (
        <DepositStatus
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      ) : (
        <span>
          Deposit {Number(current.context.tx.suggestedAmount) / 1e8}{" "}
          {current.context.tx.sourceAsset} to:{" "}
          {current.context.tx.gatewayAddress}
        </span>
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
