import { Divider, IconButton } from '@material-ui/core'
import { depositMachine, DepositMachineSchema, GatewaySession, GatewayTransaction, } from '@renproject/ren-tx'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { useLocation } from 'react-use'
import { Actor } from 'xstate'
import { ActionButton, ToggleIconButton, } from '../../../components/buttons/Buttons'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { BigWrapper, CenteringSpacedBox, MediumWrapper, } from '../../../components/layout/LayoutHelpers'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { Debug } from '../../../components/utils/Debug'
import { WalletStatus } from '../../../components/utils/types'
import { WalletConnectionProgress } from '../../../components/wallet/WalletHelpers'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { usePaperTitle } from '../../../pages/MainPage'
import { paths } from '../../../pages/routes'
import { useSelectedChainWallet } from '../../../providers/multiwallet/multiwalletHooks'
import { getCurrencyConfigByRentxName, getCurrencyShortLabel, } from '../../../utils/assetConfigs'
import { TransactionFees } from '../../transactions/components/TransactionFees'
import { BookmarkPageWarning, ProgressStatus, } from '../../transactions/components/TransactionsHelpers'
import { createTxQueryString, parseTxQueryString, TxType, useTxParam, } from '../../transactions/transactionsUtils'
import { setWalletPickerOpened } from '../../wallet/walletSlice'
import {
  DepositAcceptedStatus,
  DepositConfirmationStatus,
  DepositTo,
  DestinationPendingStatus,
  DestinationReceivedStatus,
} from '../components/MintStatuses'
import { $mint } from '../mintSlice'
import { getLockAndMintParams, useMintMachine } from '../mintUtils'

export const MintProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
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

  const walletConnected = status === WalletStatus.CONNECTED;
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

  // In order to enable quick restoration, we need to persist the deposit transaction
  // We persist via querystring, so lets check if the transaction is present
  // and update otherwise
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (!location.search) return;
    const queryTx = parseTxQueryString(location.search);
    const deposit = Object.values(queryTx?.transactions || {})[0];
    // If we have detected a deposit, but there is no deposit in the querystring
    // update the queryString to have the deposit
    // TODO: to enable quick resume, we may want to ask users to update their bookmarks
    if (activeDeposit && !deposit) {
      history.replace({
        pathname: paths.MINT_TRANSACTION,
        search: "?" + createTxQueryString(current.context.tx),
      });
    }
  }, [location, activeDeposit, current.context.tx, history]);

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
  // const [submitting, setSubmitting] = useState(false);
  const handleSubmitToDestinationChain = useCallback(() => {
    console.log("handling");
    machine.send({ type: "CLAIM" });
    // setSubmitting(true);
  }, [machine]);

  const { mintCurrencyConfig } = getLockAndMintParams(tx);
  // TODO: add date here from reverse valid until
  usePageTitle(`Minting - ${tx.targetAmount} ${mintCurrencyConfig.short}`);

  if (!machine) {
    return <div>Transaction completed</div>;
  }
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
    case "srcConfirmed": // source sourceChain confirmations ok, but renVM still doesn't accept it
      return <ProgressStatus reason="Submitting to RenVM" />;
    case "claiming":
    case "accepted": // RenVM accepted it, it can be submitted to ethereum
      return (
        <DepositAcceptedStatus
          tx={tx}
          onSubmit={handleSubmitToDestinationChain}
          submitting={stateValue === "claiming"}
        />
      );
    case "destInitiated": // final txHash means its done or check if wallet balances went up
      if (deposit.destTxHash) {
        return <DestinationReceivedStatus tx={tx} />;
      } else {
        return (
          <DestinationPendingStatus
            tx={tx}
            onSubmit={handleSubmitToDestinationChain}
            submitting={true}
          />
        );
      }

    case "restoringDeposit":
      return <ProgressStatus />;
    default:
      return <ProgressStatus reason={machine.state.value} />;
  }
};
