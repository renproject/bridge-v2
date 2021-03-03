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
import { WalletConnectionProgress } from "../../../components/wallet/WalletHelpers";
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import { usePageTitle, usePaperTitle } from "../../../providers/TitleProviders";
import {
  getChainConfigByRentxName,
  getCurrencyConfigByRentxName,
} from "../../../utils/assetConfigs";
import { $renNetwork } from "../../network/networkSlice";
import {
  BrowserNotificationButton,
  BrowserNotificationsDrawer,
} from "../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../notifications/notificationsUtils";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import {
  TransactionMenu,
  UpdateTxFn,
} from "../../transactions/components/TransactionMenu";
import {
  BookmarkPageWarning,
  ExpiredErrorDialog,
  ProgressStatus,
  WrongAddressWarningDialog,
} from "../../transactions/components/TransactionsHelpers";
import {
  useSetCurrentTxId,
  useTransactionDeletion,
} from "../../transactions/transactionsHooks";
import {
  createTxQueryString,
  getAddressExplorerLink,
  getTxPageTitle,
  isTxExpired,
  parseTxQueryString,
  TxType,
  useTxParam,
} from "../../transactions/transactionsUtils";
import {
  useAuthRequired,
  useSelectedChainWallet,
} from "../../wallet/walletHooks";
import {
  $chain,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import {
  DepositWrapper,
  MultipleDepositsMessage,
} from "../components/MintHelpers";
import {
  DestinationPendingStatus,
  MintCompletedStatus,
  MintDepositAcceptedStatus,
  MintDepositConfirmationStatus,
  MintDepositToStatus,
} from "../components/MintStatuses";
import {
  DepositNextButton,
  DepositPrevButton,
} from "../components/MultipleDepositsHelpers";
import { useDepositPagination, useMintMachine } from "../mintHooks";
import { resetMint } from "../mintSlice";
import { getLockAndMintParams, getRemainingGatewayTime } from "../mintUtils";

type MachineSend = ReturnType<typeof useMintMachine>[1];

export const MintProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  useAuthRequired(true);
  const dispatch = useDispatch();
  const chain = useSelector($chain);
  const { walletConnected } = useSelectedChainWallet();
  const { tx: parsedTx, txState } = useTxParam();
  const [reloading, setReloading] = useState(false);
  const [tx, setTx] = useState<GatewaySession>(parsedTx as GatewaySession);
  useSetCurrentTxId(tx.id);

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

  const [machineSend, setMachineSend] = useState<MachineSend>();
  const handleMachineReady = useCallback<OnMachineSendReadyFn>((send) => {
    setMachineSend(() => send);
  }, []);
  const handleUpdateTx = useCallback<UpdateTxFn>(
    (amount, vOut, txHash) => {
      const rawSourceTx = {
        amount: String(amount),
        txHash,
        transaction: {
          amount: String(amount),
          txHash,
          vOut,
          confirmations: 100,
        },
      };
      console.log("restoring");
      if (machineSend) {
        // @ts-ignore
        machineSend({ type: "RESTORE", data: { rawSourceTx } });
      }
    },
    [machineSend]
  );

  const {
    modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
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

  const [activeAmount, setActiveAmount] = useState(Number(tx.targetAmount));
  const handleActiveAmountChange = useCallback((newAmount: number) => {
    setActiveAmount(newAmount);
  }, []);

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

  const handleRestart = useCallback(() => {
    dispatch(
      resetMint({
        amount: activeAmount,
        currency: feeCurrency,
      })
    );
    history.push(paths.MINT);
  }, [dispatch, activeAmount, feeCurrency, history]);

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
          <BrowserNotificationButton
            pressed={enabled}
            onClick={handleModalOpen}
            tooltipOpened={tooltipOpened}
            onTooltipClose={handleTooltipClose}
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
          <MintTransactionStatus
            tx={tx}
            depositHash={parsedTx?.depositHash || ""}
            onMachineSendReady={handleMachineReady}
            onRestart={handleRestart}
            onActiveAmountChange={handleActiveAmountChange}
          />
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
              amount={activeAmount}
              currency={feeCurrency}
              type={TxType.MINT}
              address={tx.userAddress}
            />
          </PaperContent>
        </>
      )}
      {txState?.newTx && walletConnected && (
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
        onUpdateTx={handleUpdateTx}
      />
      <Debug it={{ parsedTx, txState: txState }} />
    </>
  );
};

type OnMachineSendReadyFn = (
  send: ReturnType<typeof useMintMachine>[1]
) => void;

type MintTransactionStatusProps = {
  tx: GatewaySession;
  onRestart: () => void;
  depositHash?: string;
  onMachineSendReady: OnMachineSendReadyFn;
  onActiveAmountChange: (amount: number) => void;
};

const MintTransactionStatus: FunctionComponent<MintTransactionStatusProps> = ({
  tx,
  depositHash = "",
  onMachineSendReady,
  onRestart,
  onActiveAmountChange,
}) => {
  const machine = useMintMachine(tx);
  const [current, send, service] = machine;
  const chain = useSelector($chain);
  const renNetwork = useSelector($renNetwork);
  const { account } = useSelectedChainWallet();

  useEffect(() => {
    onMachineSendReady(send);
  }, [onMachineSendReady, send]);

  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );

  const {
    currentIndex,
    currentHash,
    total,
    handlePrev,
    handleNext,
  } = useDepositPagination(current.context.tx, depositHash);

  const { showNotification, closeNotification } = useNotifications();
  useEffect(() => {
    let key = 0;
    if (total > 1) {
      key = showNotification(<MultipleDepositsMessage />, {
        variant: "warning",
        persist: true,
      }) as number;
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, closeNotification, total]);

  const [wrongAddressDialogOpened, setWrongAddressDialogOpened] = useState(
    false
  );
  const handleCloseWrongAddressDialog = useCallback(() => {
    setWrongAddressDialogOpened(false);
  }, []);

  useEffect(() => {
    if (
      account &&
      current.context.tx.userAddress &&
      account.toLowerCase() !== current.context.tx.userAddress.toLowerCase()
    ) {
      setWrongAddressDialogOpened(true);
    } else {
      setWrongAddressDialogOpened(false);
    }
  }, [account, current.context.tx.userAddress]);

  const activeDeposit = useMemo<{
    deposit: GatewayTransaction;
    machine: Actor<typeof depositMachine>;
  } | null>(() => {
    if (!current.context.tx.transactions) {
      return null;
    }
    const deposit = current.context.tx.transactions[currentHash];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    return { deposit, machine };
  }, [currentHash, current.context]);

  const currentAmount = activeDeposit?.deposit.sourceTxAmount;
  useEffect(() => {
    if (currentAmount) {
      onActiveAmountChange(currentAmount / 10 ** 8);
    }
  }, [currentAmount, onActiveAmountChange]);

  const [timeRemained] = useState(getRemainingGatewayTime(tx.expiryTime));

  // In order to enable quick restoration, we need to persist the deposit transaction
  // We persist via querystring, so lets check if the transaction is present
  // and update otherwise
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (!location.search) return;
    const queryTx = parseTxQueryString(location.search);
    const deposit = (queryTx?.transactions || {})[currentHash];
    // If we have detected a deposit, but there is no deposit in the querystring
    // update the queryString to have the deposit
    // TODO: to enable quick resume, we may want to ask users to update their bookmarks
    if (activeDeposit && !deposit) {
      history.replace({
        pathname: paths.MINT_TRANSACTION,
        search: "?" + createTxQueryString(current.context.tx),
      });
    }
  }, [currentHash, location, activeDeposit, current.context.tx, history]);

  const { mintCurrencyConfig } = getLockAndMintParams(
    current.context.tx,
    currentHash
  );
  const accountExplorerLink = getAddressExplorerLink(
    chain,
    renNetwork,
    account
  );
  return (
    <>
      {activeDeposit ? (
        <DepositWrapper>
          <MintTransactionDepositStatus
            tx={current.context.tx}
            deposit={activeDeposit.deposit}
            machine={activeDeposit.machine}
            depositHash={currentHash}
          />
          {total > 1 && (
            <>
              <DepositPrevButton
                onClick={handlePrev}
                disabled={currentIndex === 0}
              />
              <DepositNextButton
                onClick={handleNext}
                disabled={currentIndex === total - 1}
              />
            </>
          )}
        </DepositWrapper>
      ) : (
        <MintDepositToStatus tx={current.context.tx} />
      )}
      {
        // We want to allow users to finish mints for deposits that have been detected
        // If there are no deposits, and the gateway is expired (timeRemained < 0),
        // show the expiry modal
        (isTxExpired(current.context.tx) ||
          (timeRemained <= 0 &&
            Object.keys(current.context.tx.transactions).length === 0)) && (
          <ExpiredErrorDialog open onAction={onRestart} />
        )
      }
      <WrongAddressWarningDialog
        open={wrongAddressDialogOpened}
        address={account}
        addressExplorerLink={accountExplorerLink}
        currency={mintCurrencyConfig.short}
        onAlternativeAction={handleCloseWrongAddressDialog}
      />
      <Debug
        disable
        it={{
          depositHash,
          // pagination: { currentIndex, currentHash, total },
          // contextTx: current.context.tx,
          // activeDeposit,
          // total,
          // currentIndex,
          // currentHash,
        }}
      />
    </>
  );
};

type MintTransactionDepositStatusProps = {
  tx: GatewaySession;
  deposit: GatewayTransaction;
  machine: Actor<typeof depositMachine>;
  depositHash: string;
};

export const forceState = "srcSettling" as keyof DepositMachineSchema["states"];

export const MintTransactionDepositStatus: FunctionComponent<MintTransactionDepositStatusProps> = ({
  tx,
  deposit,
  machine,
  depositHash,
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
  if (!machine) {
    // We should always have machines for transactions
    return <ProgressStatus processing={false} reason="Restoring..." />;
  }
  console.debug(tx.id, depositHash, state);
  switch (state) {
    case "srcSettling":
      return (
        <MintDepositConfirmationStatus tx={tx} depositHash={depositHash} />
      );
    case "srcConfirmed": // source sourceChain confirmations ok, but renVM still doesn't accept it
      return <ProgressStatus reason="Submitting to RenVM" />;
    case "errorAccepting":
    case "errorSubmitting":
    case "claiming":
    case "accepted": // RenVM accepted it, it can be submitted to ethereum
      return (
        <MintDepositAcceptedStatus
          tx={tx}
          onSubmit={handleSubmitToDestinationChain}
          onReload={handleReload}
          depositHash={depositHash}
          submitting={state === "claiming"}
          submittingError={
            state === "errorSubmitting" || state === "errorAccepting"
          }
        />
      );
    case "destInitiated": // final txHash means its done or check if wallet balances went up
      return (
        <DestinationPendingStatus
          tx={tx}
          onSubmit={handleSubmitToDestinationChain}
          depositHash={depositHash}
          submitting={true}
        />
      );
    case "completed":
      if (deposit.destTxHash) {
        return <MintCompletedStatus tx={tx} depositHash={depositHash} />;
      } else {
        // FIXME: actually an error case, this shouldn't happen in this state
        return (
          <DestinationPendingStatus
            tx={tx}
            onSubmit={handleSubmitToDestinationChain}
            depositHash={depositHash}
            submitting={true}
          />
        );
      }
    case "restoringDeposit":
      return <ProgressStatus reason="Restoring deposit" />;
    default:
      return <ProgressStatus reason={machine.state.value} />;
  }
};
