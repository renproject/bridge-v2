import { Divider, IconButton } from "@material-ui/core";
import {
  depositMachine,
  DepositMachineSchema,
  GatewaySession,
  GatewayTransaction,
} from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory, useLocation } from "react-router-dom";
import { Actor } from "xstate";
import {
  ActionButton,
  ToggleIconButton,
} from "../../../components/buttons/Buttons";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import {
  CenteringSpacedBox,
  PaperSpacerWrapper,
} from "../../../components/layout/LayoutHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { WalletConnectionProgress } from "../../../components/wallet/WalletHelpers";
import { paths } from "../../../pages/routes";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { usePageTitle, usePaperTitle } from "../../../providers/TitleProviders";
import {
  getChainConfigByRentxName,
  getCurrencyConfigByRentxName,
} from "../../../utils/assetConfigs";
import { BrowserNotificationsDrawer } from "../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../notifications/notificationsUtils";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import { TransactionMenu } from "../../transactions/components/TransactionMenu";
import {
  BookmarkPageWarning,
  ProgressStatus,
} from "../../transactions/components/TransactionsHelpers";
import { useTransactionDeletion } from "../../transactions/transactionsHooks";
import {
  createTxQueryString,
  getTxPageTitle,
  parseTxQueryString,
  TxType,
  useTxParam,
} from "../../transactions/transactionsUtils";
import {
  $chain,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import {
  DestinationPendingStatus,
  MintCompletedStatus,
  MintDepositAcceptedStatus,
  MintDepositConfirmationStatus,
  MintDepositToStatus,
} from "../components/MintStatuses";
import { useMintMachine, useMintTransactionPersistence } from "../mintHooks";

export const MintProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  const dispatch = useDispatch();
  const chain = useSelector($chain);
  const { status } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const { tx: parsedTx, txState } = useTxParam();
  const [reloading, setReloading] = useState(false);
  const [tx, setTx] = useState<GatewaySession>(parsedTx as GatewaySession);

  usePageTitle(getTxPageTitle(tx));
  const [paperTitle, setPaperTitle] = usePaperTitle();
  useEffect(() => {
    if (!walletConnected) {
      setPaperTitle("Resume Transaction");
    }
  }, [walletConnected, setPaperTitle]);

  const handlePreviousStepClick = useCallback(() => {
    history.goBack();
  }, [history]);

  const {
    menuOpened,
    handleMenuOpen,
    handleMenuClose,
    handleDeleteTx,
  } = useTransactionDeletion(tx);

  const {
    modalOpened,
    handleModalOpen,
    handleModalClose,
  } = useBrowserNotificationsConfirmation();

  const { enabled, handleEnable } = useBrowserNotifications(handleModalClose);

  useEffect(() => {
    if (txState?.reloadTx) {
      setTx(parsedTx as GatewaySession);
      setReloading(true);
      history.replace({ ...location, state: undefined });
      setTimeout(() => {
        setReloading(false);
      }, 1000);
    }
  }, [history, location, txState, parsedTx]);

  const destChain = parsedTx?.destChain;
  useEffect(() => {
    if (destChain) {
      const bridgeChainConfig = getChainConfigByRentxName(destChain);
      dispatch(setChain(bridgeChainConfig.symbol));
    }
  }, [dispatch, destChain]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const onBookmarkWarningClosed = useCallback(() => {
    history.replace({ ...location, state: undefined });
  }, [history, location]);

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
        <PaperTitle>{paperTitle}</PaperTitle>
        <PaperActions>
          <ToggleIconButton
            pressed={enabled}
            variant="notifications"
            onClick={handleModalOpen}
          />
          <ToggleIconButton
            variant="settings"
            onClick={handleMenuOpen}
            pressed={menuOpened}
          />
        </PaperActions>
      </PaperHeader>
      <PaperContent bottomPadding>
        {reloading && <ProgressStatus processing />}
        {!reloading && showTransactionStatus && (
          <MintTransactionStatus tx={tx} />
        )}
        {!walletConnected && (
          <>
            <PaperSpacerWrapper>
              <CenteringSpacedBox>
                <WalletConnectionProgress />
              </CenteringSpacedBox>
            </PaperSpacerWrapper>
            <ActionButton onClick={handleWalletPickerOpen}>
              Connect Wallet
            </ActionButton>
          </>
        )}
      </PaperContent>
      {walletConnected && (
        <>
          <Divider />
          <PaperContent darker topPadding bottomPadding>
            <TransactionFees
              chain={chain}
              amount={amount}
              currency={feeCurrency}
              type={TxType.MINT}
            />
          </PaperContent>
        </>
      )}
      {txState?.newTx && (
        <BookmarkPageWarning onClosed={onBookmarkWarningClosed} />
      )}
      <BrowserNotificationsDrawer
        open={modalOpened}
        onClose={handleModalClose}
        onEnable={handleEnable}
      />
      <TransactionMenu
        tx={tx}
        open={menuOpened}
        onClose={handleMenuClose}
        onDeleteTx={handleDeleteTx}
      />
      <Debug it={{ parsedTx, txState: txState }} />
    </>
  );
};

type MintTransactionStatusProps = {
  tx: GatewaySession;
};

const MintTransactionStatus: FunctionComponent<MintTransactionStatusProps> = ({
  tx,
}) => {
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
        <MintTransactionDepositStatus
          tx={current.context.tx}
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      ) : (
        <MintDepositToStatus tx={current.context.tx} />
      )}
      <Debug it={{ contextTx: current.context.tx, activeDeposit }} />
    </>
  );
};

type MintTransactionDepositStatusProps = {
  tx: GatewaySession;
  deposit: GatewayTransaction;
  machine: Actor<typeof depositMachine>;
};

export const forceState = "srcConfirmed" as keyof DepositMachineSchema["states"];

export const MintTransactionDepositStatus: FunctionComponent<MintTransactionDepositStatusProps> = ({
  tx,
  deposit,
  machine,
}) => {
  const history = useHistory();
  const location = useLocation();
  const handleSubmitToDestinationChain = useCallback(() => {
    machine.send({ type: "CLAIM" });
  }, [machine]);
  const handleReload = useCallback(() => {
    history.replace({
      ...location,
      state: {
        txState: {
          reloadTx: true,
        },
      },
    });
  }, [history, location]);

  const state = machine?.state.value as keyof DepositMachineSchema["states"];
  useMintTransactionPersistence(tx, state);
  if (!machine) {
    return <div>Transaction completed</div>;
  }
  console.log(state);
  switch (state) {
    // switch (forceState) {
    case "srcSettling":
      return <MintDepositConfirmationStatus tx={tx} />;
    case "srcConfirmed": // source sourceChain confirmations ok, but renVM still doesn't accept it
      return <ProgressStatus reason="Submitting to RenVM" />;
    case "errorSubmitting":
    case "claiming":
    case "accepted": // RenVM accepted it, it can be submitted to ethereum
      return (
        <MintDepositAcceptedStatus
          tx={tx}
          onSubmit={handleSubmitToDestinationChain}
          onReload={handleReload}
          submitting={state === "claiming"}
          submittingError={state === "errorSubmitting"}
        />
      );
    case "destInitiated": // final txHash means its done or check if wallet balances went up
      if (deposit.destTxHash) {
        return <MintCompletedStatus tx={tx} />;
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
