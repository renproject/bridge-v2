import { Divider, IconButton } from "@material-ui/core";
import {
  BurnMachineSchema,
  BurnSession,
  GatewaySession,
} from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory, useLocation } from "react-router-dom";
import {
  ActionButton,
  ToggleIconButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
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
import {
  LabelWithValue,
  MiddleEllipsisText,
  SpacedDivider,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { WalletConnectionProgress } from "../../../components/wallet/WalletHelpers";
import { paths } from "../../../pages/routes";
import { usePageTitle, usePaperTitle } from "../../../providers/TitleProviders";
import { getChainConfigByRentxName } from "../../../utils/assetConfigs";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findExchangeRate } from "../../marketData/marketDataUtils";
import {
  BrowserNotificationButton,
  BrowserNotificationsDrawer,
} from "../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../notifications/notificationsUtils";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import { TransactionMenu } from "../../transactions/components/TransactionMenu";
import { ProgressStatus } from "../../transactions/components/TransactionsHelpers";
import {
  useSetCurrentTxId,
  useTransactionMenuControl,
} from "../../transactions/transactionsHooks";
import {
  createTxQueryString,
  getTxPageTitle,
  TxType,
  useTxParam,
} from "../../transactions/transactionsUtils";
import { useSelectedChainWallet } from "../../wallet/walletHooks";
import {
  $chain,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import {
  ReleaseCompletedStatus,
  ReleaseProgressStatus,
} from "../components/ReleaseStatuses";
import { useBurnMachine } from "../releaseHooks";
import { getBurnAndReleaseParams } from "../releaseUtils";

export const ReleaseProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const chain = useSelector($chain);
  const rates = useSelector($exchangeRates);
  const [reloading, setReloading] = useState(false);
  const { tx: parsedTx, txState } = useTxParam();
  const [tx, setTx] = useState<BurnSession<any, any>>(
    parsedTx as BurnSession<any, any>
  ); // TODO Partial<GatewaySession>
  useSetCurrentTxId(tx.id);

  usePageTitle(getTxPageTitle(tx));
  const [paperTitle, setPaperTitle] = usePaperTitle();
  useEffect(() => {
    if (!walletConnected) {
      setPaperTitle("Resume Transaction");
    }
  }, [walletConnected, setPaperTitle]);

  useEffect(() => {
    if (txState?.reloadTx) {
      setTx(parsedTx as BurnSession<any, any>);
      setReloading(true);
      history.replace({ ...location, state: undefined });
      setTimeout(() => {
        setReloading(false);
      }, 1000);
    }
  }, [history, location, txState, parsedTx]);

  const handlePreviousStepClick = useCallback(() => {
    history.goBack();
  }, [history]);
  const sourceChain = parsedTx?.sourceChain;

  const {
    menuOpened,
    handleMenuOpen,
    handleMenuClose,
  } = useTransactionMenuControl();

  const {
    modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
  } = useBrowserNotificationsConfirmation();

  const { enabled, handleEnable } = useBrowserNotifications(handleModalClose);

  useEffect(() => {
    if (sourceChain) {
      const bridgeChainConfig = getChainConfigByRentxName(sourceChain);
      dispatch(setChain(bridgeChainConfig.symbol));
    }
  }, [dispatch, sourceChain]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const {
    burnCurrencyConfig,
    burnChainConfig,
    releaseCurrencyConfig,
  } = getBurnAndReleaseParams(tx);
  const amount = Number(tx.targetAmount);
  const releaseCurrencyUsdRate = findExchangeRate(
    rates,
    releaseCurrencyConfig.symbol
  );
  const amountUsd = amount * releaseCurrencyUsdRate;

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
        {walletConnected && !reloading && <ReleaseTransactionStatus tx={tx} />}
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
            <LabelWithValue
              label="Releasing"
              value={
                <NumberFormatText
                  value={amount}
                  spacedSuffix={burnCurrencyConfig.short}
                />
              }
              valueEquivalent={
                <NumberFormatText
                  value={amountUsd}
                  prefix="$"
                  decimalScale={2}
                  fixedDecimalScale
                />
              }
            />
            <LabelWithValue label="From" value={burnChainConfig.full} />
            <LabelWithValue
              label="To"
              value={
                <MiddleEllipsisText hoverable>
                  {tx.destAddress}
                </MiddleEllipsisText>
              }
            />
            <SpacedDivider />
            <TransactionFees
              chain={chain}
              amount={amount}
              currency={burnCurrencyConfig.symbol}
              type={TxType.BURN}
            />
            <Debug it={{ parsedTx, txState: txState }} />
          </PaperContent>
        </>
      )}
      <BrowserNotificationsDrawer
        open={modalOpened}
        onClose={handleModalClose}
        onEnable={handleEnable}
      />
      <TransactionMenu tx={tx} open={menuOpened} onClose={handleMenuClose} />
      <Debug it={{ tooltipOpened, parsedTx, txState: txState }} />
    </>
  );
};

type ReleaseTransactionStatusProps = {
  tx: BurnSession<any, any>;
};

const ReleaseTransactionStatus: FunctionComponent<ReleaseTransactionStatusProps> = ({
  tx,
}) => {
  const history = useHistory();
  const location = useLocation();
  const [current, send, service] = useBurnMachine(tx);
  useEffect(
    () => () => {
      console.info("stopping tx machine");
      service.stop();
    },
    [service]
  );

  const [submitting, setSubmitting] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    send({ type: "SUBMIT" });
    setTimeout(() => {
      setTimeoutError(true);
    }, 60000);
  }, [send]);
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

  useEffect(() => {
    if (current.value === "srcSettling") {
      history.replace({
        pathname: paths.RELEASE_TRANSACTION,
        search: "?" + createTxQueryString(current.context.tx),
      });
    }
  }, [history, current.value, current.context.tx]);

  // const forceState = "errorReleasing";
  const state = current.value as keyof BurnMachineSchema["states"];
  console.debug(tx.id, state);
  switch (state) {
    // switch (forceState as keyof BurnMachineSchema["states"]) {
    case "created":
      return (
        <ReleaseProgressStatus
          tx={tx}
          onSubmit={handleSubmit}
          submitting={submitting}
          submittingError={timeoutError}
          onReload={handleReload}
        />
      );
    case "errorBurning":
    case "errorReleasing":
    case "srcSettling":
      return (
        <ReleaseProgressStatus
          tx={current.context.tx}
          pending
          generalError={state !== "srcSettling"}
          onReload={handleReload}
        />
      );
    case "srcConfirmed":
      return <ProgressStatus reason="Submitting to RenVM" />;
    case "accepted":
      return <ProgressStatus reason="Releasing from RenVM" />;
    case "destInitiated":
      return <ReleaseCompletedStatus tx={current.context.tx} />;
    default:
      return <ProgressStatus />;
  }
};
