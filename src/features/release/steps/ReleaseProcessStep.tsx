import { Divider, IconButton } from "@material-ui/core";
import { BurnMachineSchema, GatewaySession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router-dom";
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
  SpacedDivider,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { WalletConnectionProgress } from "../../../components/wallet/WalletHelpers";
import { paths } from "../../../pages/routes";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { usePageTitle, usePaperTitle } from "../../../providers/TitleProviders";
import { getChainConfigByRentxName } from "../../../utils/assetConfigs";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findExchangeRate } from "../../marketData/marketDataUtils";
import { BrowserNotificationsDrawer } from "../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../notifications/notificationsUtils";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import { TransactionMenu } from "../../transactions/components/TransactionMenu";
import { ProgressStatus } from "../../transactions/components/TransactionsHelpers";
import {
  createTxQueryString,
  getTxPageTitle,
  TxType,
  useTransactionDeletion,
  useTxParam,
} from "../../transactions/transactionsUtils";
import {
  $chain,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import {
  ReleaseCompletedStatus,
  ReleaseProgressStatus,
} from "../components/ReleaseStatuses";
import {
  getBurnAndReleaseParams,
  useBurnMachine,
  useReleaseTransactionPersistence,
} from "../releaseUtils";

export const ReleaseProcessStep: FunctionComponent<RouteComponentProps> = (
  props
) => {
  const { history } = props;
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const chain = useSelector($chain);
  const rates = useSelector($exchangeRates);
  const { tx: parsedTx, txState } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); // TODO Partial<GatewaySession>

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
  const sourceChain = parsedTx?.sourceChain;

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
        {walletConnected && <ReleaseTransactionStatus tx={tx} />}
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
            <LabelWithValue label="To" value={tx.destAddress} />
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
      <TransactionMenu
        tx={tx}
        open={menuOpened}
        onClose={handleMenuClose}
        onDeleteTx={handleDeleteTx}
      />
    </>
  );
};

type ReleaseTransactionStatusProps = {
  tx: GatewaySession;
};

const ReleaseTransactionStatus: FunctionComponent<ReleaseTransactionStatusProps> = ({
  tx,
}) => {
  const history = useHistory();
  const [current, send, service] = useBurnMachine(tx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    send({ type: "SUBMIT" });
  }, [send]);

  useEffect(() => {
    if (current.value === "srcSettling") {
      history.replace({
        pathname: paths.RELEASE_TRANSACTION,
        search: "?" + createTxQueryString(current.context.tx),
      });
    }
  }, [history, current.value, current.context.tx]);

  console.log("release current.value", current.value);
  console.log("ctx", current.context.tx);
  // const forceState = "srcConfirmed";
  const state = current.value as keyof BurnMachineSchema["states"];
  useReleaseTransactionPersistence(current.context.tx, state);
  switch (state) {
    // switch (forceState as keyof BurnMachineSchema["states"]) {
    case "created":
      return (
        <ReleaseProgressStatus
          tx={tx}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      );
    case "srcSettling":
      return <ReleaseProgressStatus tx={current.context.tx} pending />;
    case "srcConfirmed": // return <ProgressStatus reason="Submitting to RenVM" />;
    case "destInitiated":
      return <ReleaseCompletedStatus tx={current.context.tx} />;
    default:
      return <ProgressStatus />;
  }
};
