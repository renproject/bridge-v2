import { Divider, IconButton } from '@material-ui/core'
import { depositMachine, DepositMachineSchema, GatewaySession, GatewayTransaction, } from '@renproject/rentx'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import { Actor } from 'xstate'
import { ActionButton, ToggleIconButton, } from '../../../components/buttons/Buttons'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { BigWrapper, CenteringSpacedBox, MediumWrapper, } from '../../../components/layout/LayoutHelpers'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { Debug } from '../../../components/utils/Debug'
import { WalletConnectionProgress } from '../../../components/wallet/WalletHelpers'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { usePaperTitle } from '../../../pages/MainPage'
import { useSelectedChainWallet } from '../../../providers/multiwallet/multiwalletHooks'
import {
  getChainConfigByRentxName,
  getCurrencyConfigByRentxName,
  getCurrencyShortLabel,
  getNetworkConfigByRentxName,
} from '../../../utils/assetConfigs'
import { useGasPrices } from '../../marketData/marketDataHooks'
import { TransactionFees } from '../../transactions/components/TransactionFees'
import { BookmarkPageWarning, ProgressStatus, } from '../../transactions/components/TransactionsHelpers'
import { TxType, useTxParam } from '../../transactions/transactionsUtils'
import { setWalletPickerOpened } from '../../wallet/walletSlice'
import {
  DepositAcceptedStatus,
  DepositConfirmationStatus,
  DepositTo,
  DestinationPendingStatus,
  DestinationReceivedStatus,
} from '../components/MintStatuses'
import { $mint } from '../mintSlice'
import { useMintMachine } from '../mintUtils'

export const MintProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  useGasPrices();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const { currency } = useSelector($mint);
  const [title, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(`Send ${getCurrencyShortLabel(currency)}`);
  }, [setTitle, currency]);
  const { tx: parsedTx, txState } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); // TODO Partial<GatewaySession>

  const handlePreviousStepClick = useCallback(() => {
    history.goBack();
  }, [history]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const onBookmarkWarningClosed = useCallback(() => {
    history.replace({ ...location, state: undefined });
  }, [history, location]);

  const walletConnected = status === "connected";
  const showTransactionStatus = !!tx && walletConnected;
  const feeCurrency = getCurrencyConfigByRentxName(tx.sourceAsset).symbol;
  const amount = Number(tx.targetAmount);
  return (
    <>
      <PaperHeader>
        <PaperNav>
          {txState?.newTx && (
            <IconButton onClick={handlePreviousStepClick}>
              <BackArrowIcon />
            </IconButton>
          )}
        </PaperNav>
        <PaperTitle>{title}</PaperTitle>
        <PaperActions>
          <ToggleIconButton variant="settings" />
          <ToggleIconButton variant="notifications" />
        </PaperActions>
      </PaperHeader>
      <PaperContent bottomPadding>
        {showTransactionStatus && <MintTransactionStatus tx={tx} />}
        {!walletConnected && (
          <BigWrapper>
            <MediumWrapper>
              <CenteringSpacedBox>
                <WalletConnectionProgress />
              </CenteringSpacedBox>
            </MediumWrapper>
            <ActionButton onClick={handleWalletPickerOpen}>
              Connect Wallet
            </ActionButton>
          </BigWrapper>
        )}
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <TransactionFees
          amount={amount}
          currency={feeCurrency}
          type={TxType.MINT}
        />
        <Debug it={{ parsedTx, txState: txState }} />
      </PaperContent>
      {txState?.newTx && (
        <BookmarkPageWarning onClosed={onBookmarkWarningClosed} />
      )}
    </>
  );
};

type MintTransactionStatusProps = {
  tx: GatewaySession;
};

const MintTransactionStatus: FunctionComponent<MintTransactionStatusProps> = ({
  tx,
}) => {
  console.log("rendering mts...");
  const [current] = useMintMachine(tx);

  const activeDeposit = useMemo<{
    deposit: GatewayTransaction;
    machine: Actor<typeof depositMachine>;
  } | null>(() => {
    if (!current.context.tx.transactions) {
      return null;
    }
    const deposit = Object.values(current.context.tx.transactions)[0];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    return { deposit, machine };
  }, [current.context]);

  console.log(current.context.tx);
  useEffect(() => {
    console.log("eff", current.context);
  }, [current.context]);
  return (
    <>
      {activeDeposit ? (
        <DepositStatus
          tx={current.context.tx}
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      ) : (
        <DepositTo tx={current.context.tx} />
      )}
      <Debug it={{ contextTx: current.context.tx, activeDeposit }} />
    </>
  );
};

type DepositStatusProps = {
  tx: GatewaySession;
  deposit: GatewayTransaction;
  machine: Actor<typeof depositMachine>;
};

export const forceState = "srcConfirmed" as keyof DepositMachineSchema["states"];

export const DepositStatus: FunctionComponent<DepositStatusProps> = ({
  tx,
  deposit,
  machine,
}) => {
  const handleSubmitToDestinationChain = useCallback(() => {
    machine.send({ type: "CLAIM" });
  }, [machine]);

  console.log("state value", machine.state.value);
  const sourceCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const destinationCurrencyConfig = getCurrencyConfigByRentxName(
    tx.sourceAsset
  ); // TODO: change
  const sourceChainConfig = getChainConfigByRentxName(tx.sourceNetwork);
  const destinationChainConfig = getChainConfigByRentxName(tx.destNetwork);
  const networkConfig = getNetworkConfigByRentxName(tx.network);

  usePageTitle(
    `Minting - ${tx.targetAmount} ${destinationCurrencyConfig.short}`
  );

  if (!machine) {
    return <div>Transaction completed</div>;
  }
  const sourceTxHash = (deposit.rawSourceTx as any).txHash || ""; // TODO resolve DepositCommon issue
  const stateValue = machine.state
    .value as keyof DepositMachineSchema["states"];
  console.log("stv", stateValue);

  switch (stateValue) {
    // switch (forceState) {
    case "srcSettling":
      return (
        <>
          <DepositConfirmationStatus tx={tx} />
        </>
      );
    case "srcConfirmed": // source chain confirmations ok, but renVM still doesn't accept it
    case "claiming":
    case "accepted": // RenVM accepted it, it can be submitted to ethereum
      return (
        <DepositAcceptedStatus
          network={networkConfig.symbol}
          sourceCurrency={sourceCurrencyConfig.symbol}
          sourceAmount={deposit.sourceTxAmount / 1e8}
          sourceChain={sourceChainConfig.symbol}
          sourceTxHash={sourceTxHash}
          sourceConfirmations={deposit.sourceTxConfs}
          sourceConfirmationsTarget={deposit.sourceTxConfTarget} // TODO: resolve
          destinationChain={destinationChainConfig.symbol}
          onSubmit={handleSubmitToDestinationChain}
          submitting={stateValue === "claiming"}
        />
      );
    case "destInitiated": // final txHash means its done or check if wallet balances went up
      if (deposit.destTxHash) {
        return (
          <DestinationReceivedStatus
            network={networkConfig.symbol}
            sourceCurrency={sourceCurrencyConfig.symbol}
            sourceChain={sourceChainConfig.symbol}
            sourceTxHash={sourceTxHash}
            destinationCurrency={destinationCurrencyConfig.symbol}
            destinationChain={destinationChainConfig.symbol}
            destinationTxHash={deposit.destTxHash || ""}
            destinationAmount={Number(tx.targetAmount)}
          />
        );
      } else {
        return (
          <DestinationPendingStatus
            network={networkConfig.symbol}
            sourceCurrency={sourceCurrencyConfig.symbol}
            sourceAmount={deposit.sourceTxAmount / 1e8}
            sourceChain={sourceChainConfig.symbol}
            sourceTxHash={sourceTxHash}
            destinationChain={destinationChainConfig.symbol}
            onSubmit={handleSubmitToDestinationChain}
            submitting={true}
            destinationTxHash={deposit.destTxHash || ""}
          />
        );
      }

    case "restoringDeposit":
      return <ProgressStatus />;
    default:
      return <ProgressStatus reason={machine.state.value} />;
  }
};
