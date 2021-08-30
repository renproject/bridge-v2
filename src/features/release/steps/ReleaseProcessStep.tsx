import { Divider, IconButton } from "@material-ui/core";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { BurnMachineSchema } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory, useLocation } from "react-router-dom";
import { useAsync } from "react-use";
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
import { WalletConnectionProgress } from "../../wallet/components/WalletHelpers";
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import { usePageTitle, usePaperTitle } from "../../../providers/TitleProviders";
import { getBurnChainMap } from "../../../services/rentx";
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
import {
  AnyBurnSession,
  ProgressStatus,
} from "../../transactions/components/TransactionsHelpers";
import {
  useSetCurrentTxId,
  useTransactionMenuControl,
} from "../../transactions/transactionsHooks";
import {
  createTxQueryString,
  getReleaseTxPageTitle,
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
  ReleaseAcceptedStatus,
  ReleaseCompletedStatus,
  ReleaseProgressStatus,
} from "../components/ReleaseStatuses";
import { useBurnMachine } from "../releaseHooks";
import { getBurnAndReleaseParams } from "../releaseUtils";

export const ReleaseProcessStep: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const chain = useSelector($chain);
  const rates = useSelector($exchangeRates);
  const [reloading, setReloading] = useState(false);
  const { tx: parsedTx, txState } = useTxParam();
  const [tx, setTx] = useState<AnyBurnSession>(parsedTx as AnyBurnSession); // TODO Partial<GatewaySession>
  useSetCurrentTxId(tx.id);

  usePageTitle(getReleaseTxPageTitle(tx));
  const [paperTitle, setPaperTitle] = usePaperTitle();
  useEffect(() => {
    if (!walletConnected) {
      setPaperTitle(t("tx.resume-transaction"));
    }
  }, [walletConnected, setPaperTitle, t]);

  useEffect(() => {
    if (txState?.reloadTx) {
      setTx(parsedTx as AnyBurnSession);
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

  const { enabledChains } = useMultiwallet();
  const burnChainMap = useAsync(async () => {
    const providers = Object.entries(enabledChains).reduce(
      (c, n) => ({
        ...c,
        [n[0]]: n[1].provider,
      }),
      {}
    );
    return await getBurnChainMap(providers);
  }, [enabledChains]);

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
        {walletConnected && !reloading && !burnChainMap.loading && (
          <ReleaseTransactionStatus tx={tx} burnChainMap={burnChainMap.value} />
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
            <LabelWithValue
              label={t("release.releasing-label")}
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
            <LabelWithValue
              label={t("release.from-label")}
              value={burnChainConfig.full}
            />
            <LabelWithValue
              label={t("release.to-label")}
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
  tx: AnyBurnSession;
  burnChainMap: any;
};

const ReleaseTransactionStatus: FunctionComponent<ReleaseTransactionStatusProps> = ({
  tx,
  burnChainMap,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [current, send, service] = useBurnMachine(tx, burnChainMap);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );
  const { showNotification } = useNotifications();

  const [submitting, setSubmitting] = useState(false);
  const [timeoutError] = useState(false);
  const [timeoutKey, setTimeoutKey] = useState<number>();
  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    send({ type: "SUBMIT" });
    setTimeout(() => {
      const key = showNotification(
        <span>
          {t("release.no-confirmations-message-1")} <br />
          {t("release.no-confirmations-message-2", {
            currency: tx.sourceAsset.toUpperCase(),
          })}
        </span>,
        {
          variant: "warning",
          persist: true,
        }
      ) as number;
      setTimeoutKey(key);
      // This isn't a great solution because users might end up burning twice
      // setTimeoutError(true);
    }, 1 * 60 * 1000);
  }, [t, send, setTimeoutKey, showNotification, tx.sourceAsset]);
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
    if (current.value === "accepted") {
      clearTimeout(timeoutKey);
    }
    if (current.value === "srcSettling") {
      history.replace({
        pathname: paths.RELEASE_TRANSACTION,
        search: "?" + createTxQueryString(current.context.tx),
      });
    }
  }, [history, timeoutKey, current.value, current.context.tx]);

  // const forceState = "accepted";
  const state = current.value as keyof BurnMachineSchema["states"];
  console.debug(tx.id, state);
  switch (state) {
    // switch (forceState as keyof BurnMachineSchema["states"]) {
    case "created":
    case "submittingBurn":
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
      return <ReleaseAcceptedStatus tx={current.context.tx} />;
    case "destInitiated":
      return <ReleaseCompletedStatus tx={current.context.tx} />;
    default:
      return <ProgressStatus />;
  }
};
