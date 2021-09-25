import { Divider, IconButton } from "@material-ui/core";
import {
  DepositMachineSchema,
  ErroringGatewaySession,
  GatewaySession,
  GatewayTransaction,
  mintMachine,
  OpenedGatewaySession,
} from "@renproject/ren-tx";
import * as Sentry from "@sentry/react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
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
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import { usePageTitle, usePaperTitle } from "../../../providers/TitleProviders";
import { getCurrencyConfigByRentxName } from "../../../utils/assetConfigs";
import { useFetchFees } from "../../fees/feesHooks";
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
  ExpiredErrorDialog,
  FinishTransactionWarning,
  GatewayAddressTimeoutErrorDialog,
  ProgressStatus,
  WrongAddressWarningDialog,
} from "../../transactions/components/TransactionsHelpers";
import {
  useSetCurrentSessionData,
  useTransactionMenuControl,
} from "../../transactions/transactionsHooks";
import {
  createTxQueryString,
  getAddressExplorerLink,
  getMintTxPageTitle,
  isTxExpired,
  parseTxQueryString,
  TxType,
  useTxParam,
} from "../../transactions/transactionsUtils";
import { WalletConnectionProgress } from "../../wallet/components/WalletHelpers";
import { useSelectedChainWallet } from "../../wallet/walletHooks";
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
import { ResponsiveDepositNavigation } from "../components/MultipleDepositsHelpers";
import { useDepositPagination, useMintMachine } from "../mintHooks";
import { resetMint } from "../mintSlice";
import {
  getLockAndMintBasicParams,
  getRemainingGatewayTime,
} from "../mintUtils";

type MachineSend = ReturnType<typeof useMintMachine>[1];

export const MintProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const chain = useSelector($chain);
  const { walletConnected } = useSelectedChainWallet();
  const { tx: parsedTx, txState } = useTxParam();
  const [reloading, setReloading] = useState(false);
  const [tx, setTx] = useState<GatewaySession<any>>(
    parsedTx as GatewaySession<any>
  );
  useSetCurrentSessionData(tx.id, tx);

  usePageTitle(getMintTxPageTitle(tx));
  const [paperTitle, setPaperTitle] = usePaperTitle();
  useEffect(() => {
    if (!walletConnected) {
      setPaperTitle(t("tx.resume-transaction"));
    }
  }, [walletConnected, setPaperTitle, t]);

  const handlePreviousStepClick = useCallback(() => {
    history.goBack();
  }, [history]);

  const {
    menuOpened,
    handleMenuOpen,
    handleMenuClose,
  } = useTransactionMenuControl();

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
      if (machineSend) {
        // @ts-ignore
        machineSend({
          type: "RESTORE",
          data: { rawSourceTx, sourceTxHash: txHash },
        });
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
      setTx(parsedTx as GatewaySession<any>);
      setReloading(true);
      history.replace({ ...location, state: undefined });
      setTimeout(() => {
        setReloading(false);
      }, 1000);
    }
  }, [history, location, txState, parsedTx]);

  const [activeAmount, setActiveAmount] = useState(
    Number((tx as any).targetAmount)
  );
  const handleActiveAmountChange = useCallback((newAmount: number) => {
    setActiveAmount(newAmount);
  }, []);

  const destChain = parsedTx?.destChain;
  const {
    mintChainConfig,
    mintCurrencyConfig,
    lockChainConfig,
  } = getLockAndMintBasicParams(tx);

  useEffect(() => {
    if (destChain) {
      dispatch(setChain(mintChainConfig.symbol));
    }
  }, [dispatch, destChain, mintChainConfig.symbol]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const onWarningClosed = useCallback(() => {
    history.replace({ ...location, state: undefined });
  }, [history, location]);

  const showTransactionStatus = !!tx && walletConnected;
  const feeCurrency = getCurrencyConfigByRentxName(tx.sourceAsset).symbol;

  const handleRestart = useCallback(() => {
    dispatch(
      resetMint({
        currency: feeCurrency,
      })
    );
    history.push(paths.MINT);
  }, [dispatch, feeCurrency, history]);

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
              {t("wallet.connect")}
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
        <FinishTransactionWarning
          onClosed={onWarningClosed}
          timeRemained={getRemainingGatewayTime(tx.expiryTime)}
          lockChainBlockTime={lockChainConfig.blockTime}
          lockCurrencyLabel={lockChainConfig.full}
          lockChainConfirmations={lockChainConfig.targetConfirmations}
          mintChainLabel={mintChainConfig.full}
          mintCurrencyLabel={mintCurrencyConfig.short}
        />
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
  tx: GatewaySession<any>;
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
  const [current, send, service] = useMintMachine(tx);
  const chain = useSelector($chain);
  const renNetwork = useSelector($renNetwork);
  const { account } = useSelectedChainWallet();

  const [currentDeposit, setCurrentDeposit] = useState(
    depositHash || "gateway"
  );
  const handleCurrentDepositChange = useCallback((_, newDeposit) => {
    if (newDeposit !== null) {
      setCurrentDeposit(newDeposit);
    }
  }, []);

  const handleGoToGateway = useCallback(() => {
    setCurrentDeposit("gateway");
  }, []);

  useEffect(() => {
    onMachineSendReady(send);
  }, [onMachineSendReady, send]);

  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );

  const { total, orderedHashes } = useDepositPagination(current.context.tx);

  const lastDepositHash = total > 0 ? orderedHashes[total - 1] : "";
  useEffect(() => {
    if (total >= 1) {
      setCurrentDeposit((current) => {
        if (current === "gateway") {
          return lastDepositHash;
        }
        return current;
      });
    }
  }, [total, lastDepositHash]);

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
    deposit: GatewayTransaction<any>;
    machine: Actor<typeof mintMachine>;
  } | null>(() => {
    if (!current.context.tx.transactions || currentDeposit === "gateway") {
      return null;
    }
    const deposit = current.context.tx.transactions[currentDeposit];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    Sentry.captureMessage(`loaded deposit${deposit.sourceTxHash}`);
    return { deposit, machine } as any;
  }, [currentDeposit, current.context]);

  const currentAmount = activeDeposit?.deposit.sourceTxAmount;

  const {
    mintCurrencyConfig,
    lockCurrencyConfig,
    decimals,
  } = getLockAndMintBasicParams(current.context.tx);

  useEffect(() => {
    if (currentAmount) {
      onActiveAmountChange(Number(currentAmount) / 10 ** decimals);
    }
  }, [currentAmount, onActiveAmountChange, decimals]);

  const [timeRemained] = useState(getRemainingGatewayTime(tx.expiryTime));

  // In order to enable quick restoration, we need to persist the deposit transaction
  // We persist via querystring, so lets check if the transaction is present
  // and update otherwise
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (!location.search || currentDeposit === "gateway") return;
    const queryTx = parseTxQueryString(location.search);
    const deposit = (queryTx?.transactions || {})[currentDeposit];
    // If we have detected a deposit, but there is no deposit in the querystring
    // update the queryString to have the deposit
    // TODO: to enable quick resume, we may want to ask users to update their bookmarks
    if (activeDeposit && !deposit) {
      history.replace({
        pathname: paths.MINT_TRANSACTION,
        search: "?" + createTxQueryString(current.context.tx),
      });
    }
  }, [currentDeposit, location, activeDeposit, current.context.tx, history]);

  const accountExplorerLink = getAddressExplorerLink(
    chain,
    renNetwork,
    account
  );

  const { fees } = useFetchFees(lockCurrencyConfig.symbol, TxType.MINT);
  const minimumAmount = (fees.lock / 10 ** decimals) * 2;

  const getewayInitializeError = current.value === "srcInitializeError";
  const [gatewayTimeout, setGatewayTimeout] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGatewayTimeout(true);
    }, 30 * 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  const gatewayError =
    getewayInitializeError ||
    (gatewayTimeout &&
      !(current.context.tx as OpenedGatewaySession<any>).gatewayAddress);

  return (
    <>
      <DepositWrapper>
        <ResponsiveDepositNavigation
          value={currentDeposit}
          onChange={handleCurrentDepositChange}
          tx={current.context.tx}
        />
        {activeDeposit ? (
          <MintTransactionDepositStatus
            tx={current.context.tx}
            deposit={activeDeposit.deposit}
            machine={activeDeposit.machine}
            depositHash={currentDeposit}
            onGoToGateway={handleGoToGateway}
          />
        ) : (
          <MintDepositToStatus
            tx={current.context.tx as OpenedGatewaySession<any>}
            minimumAmount={minimumAmount}
          />
        )}
      </DepositWrapper>
      {gatewayError && <GatewayAddressTimeoutErrorDialog open />}
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
        it={{
          current,
          depositHash,
          fees,
        }}
      />
    </>
  );
};

type MintTransactionDepositStatusProps = {
  tx: GatewaySession<any>;
  deposit: GatewayTransaction<any>;
  machine: Actor<typeof mintMachine>;
  depositHash: string;
  onGoToGateway: () => void;
};

export const forceState = "srcSettling" as keyof DepositMachineSchema<any>["states"];

export const MintTransactionDepositStatus: FunctionComponent<MintTransactionDepositStatusProps> = ({
  tx,
  deposit,
  machine,
  depositHash,
  onGoToGateway,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const handleSubmitToDestinationChain = useCallback(() => {
    machine.send({ type: "CLAIM" });
  }, [machine]);

  const handleRetry = useCallback(() => {
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

  const state = machine?.state
    .value as keyof DepositMachineSchema<any>["states"];
  console.info(state);
  if (!machine) {
    // We should always have machines for transactions
    return (
      <ProgressStatus
        processing={false}
        reason={t("mint.status-restoring-label")}
      />
    );
  }

  switch (state) {
    case "srcSettling":
      return (
        <MintDepositConfirmationStatus tx={tx} depositHash={depositHash} />
      );
    case "srcConfirmed": // source sourceChain confirmations ok, but renVM still doesn't accept it
      return (
        <ProgressStatus reason={t("mint.status-submitting-to-renvm-label")} />
      );
    case "errorAccepting":
    case "errorSubmitting":
    case "claiming":
    case "accepted": // RenVM accepted it, it can be submitted to ethereum
      return (
        <MintDepositAcceptedStatus
          tx={tx as ErroringGatewaySession<any>}
          onSubmit={handleSubmitToDestinationChain}
          onReload={handleReload}
          onRetry={handleRetry}
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
      if ((deposit as any).destTxHash !== undefined) {
        return (
          <MintCompletedStatus
            tx={tx}
            depositHash={depositHash}
            onGoToGateway={onGoToGateway}
          />
        );
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
      return (
        <ProgressStatus reason={t("mint.status-restoring-deposit-label")} />
      );
    default:
      return (
        <ProgressStatus reason={t(`mint.status-${machine.state.value}`)} />
      );
  }
};
