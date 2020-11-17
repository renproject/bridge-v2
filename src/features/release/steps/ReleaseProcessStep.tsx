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
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
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
import { WalletStatus } from '../../../components/utils/types'
import { WalletConnectionProgress } from "../../../components/wallet/WalletHelpers";
import { usePaperTitle } from "../../../pages/MainPage";
import { paths } from "../../../pages/routes";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findExchangeRate } from "../../marketData/marketDataUtils";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import {
  BookmarkPageWarning,
  ProgressStatus,
} from "../../transactions/components/TransactionsHelpers";
import {
  createTxQueryString,
  TxType,
  useTxParam,
} from "../../transactions/transactionsUtils";
import { setWalletPickerOpened } from "../../wallet/walletSlice";
import {
  ReleaseCompletedStatus,
  ReleaseProgressStatus,
} from "../components/ReleaseStatuses";
import { getBurnAndReleaseParams, useBurnMachine } from "../releaseUtils";

export const ReleaseProcessStep: FunctionComponent<RouteComponentProps> = (
  props
) => {
  const { history, location } = props;
  const [title] = usePaperTitle();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const rates = useSelector($exchangeRates);
  const { tx: parsedTx, txState } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); // TODO Partial<GatewaySession>

  const handlePreviousStepClick = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);
  const walletConnected = status === WalletStatus.CONNECTED;

  const { burnCurrencyConfig, releaseCurrencyConfig } = getBurnAndReleaseParams(
    tx
  );
  const amount = Number(tx.targetAmount);
  const releaseCurrencyUsdRate = findExchangeRate(
    rates,
    releaseCurrencyConfig.symbol
  );
  const amountUsd = amount * releaseCurrencyUsdRate;

  const onBookmarkWarningClosed = useCallback(() => {
    history.replace({ ...location, state: undefined });
  }, [history, location]);

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
        {walletConnected && <ReleaseTransactionStatus tx={tx} />}
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
        <LabelWithValue label="To" value={tx.destAddress} />
        <SpacedDivider />
        <TransactionFees
          amount={amount}
          currency={burnCurrencyConfig.symbol}
          type={TxType.BURN}
        />
        <Debug it={{ parsedTx, txState: txState }} />
      </PaperContent>
      {txState?.newTx && (
        <BookmarkPageWarning onClosed={onBookmarkWarningClosed} />
      )}
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

  console.log("current.value", current.value);
  console.log("ctx", current.context.tx);
  switch (current.value as keyof BurnMachineSchema["states"]) {
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
    case "srcConfirmed":
    case "destInitiated":
      return <ReleaseCompletedStatus tx={current.context.tx} />;
  }
  return <ProgressStatus />;
};
