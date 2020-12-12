import { Box, Grow, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import QRCode from "qrcode.react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  TransactionDetailsButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import {
  CenteringSpacedBox,
  MediumWrapper,
} from "../../../components/layout/LayoutHelpers";
import { Link } from "../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../components/typography/TypographyHelpers";
import {
  usePaperTitle,
  useSetActionRequired,
  useSetPaperTitle,
} from "../../../providers/TitleProviders";
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import { orangeLight } from "../../../theme/colors";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { useBrowserNotifications } from "../../notifications/notificationsUtils";
import { ProcessingTimeWrapper } from "../../transactions/components/TransactionsHelpers";
import { getPaymentLink, TxType } from "../../transactions/transactionsUtils";
import { getLockAndMintParams } from "../mintUtils";
import { resetMint } from "../mintSlice";

const getAddressValidityMessage = (time: number) => {
  const unit = "hours";
  return `This Gateway Address is only valid for ${time} ${unit}. Do not send multiple deposits or deposit after ${time} ${unit}.`;
};

export type MintDepositToProps = {
  tx: GatewaySession;
};

export const MintDepositToStatus: FunctionComponent<MintDepositToProps> = ({
  tx,
}) => {
  const [showQr, setShowQr] = useState(false);
  const toggleQr = useCallback(() => {
    setShowQr(!showQr);
  }, [showQr]);
  const { showNotification, closeNotification } = useNotifications();
  useEffect(() => {
    const time = Math.ceil((tx.expiryTime - Number(new Date())) / 1000 / 3600);
    let key = 0;
    if (time > 0) {
      key = showNotification(getAddressValidityMessage(time), {
        variant: "warning",
      }) as number;
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, closeNotification, tx.expiryTime]);

  const {
    lockCurrencyConfig,
    lockChainConfig,
    suggestedAmount,
  } = getLockAndMintParams(tx);
  const { color } = lockCurrencyConfig;
  const { MainIcon } = lockChainConfig;

  useSetPaperTitle(`Send ${lockChainConfig.short}`);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={color || orangeLight} size={64}>
          <MainIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <MediumWrapper>
        <BigAssetAmount
          value={
            <span>
              Send{" "}
              <NumberFormatText
                value={suggestedAmount}
                spacedSuffix={lockCurrencyConfig.short}
              />{" "}
              to
            </span>
          }
        />
      </MediumWrapper>
      {!!tx.gatewayAddress && (
        <>
          {showQr && (
            <CenteringSpacedBox>
              <Grow in={showQr}>
                <BigQrCode>
                  <QRCode
                    value={getPaymentLink(
                      lockChainConfig.symbol,
                      tx.gatewayAddress,
                      suggestedAmount
                    )}
                  />
                </BigQrCode>
              </Grow>
            </CenteringSpacedBox>
          )}
          <CopyContentButton content={tx.gatewayAddress} />
        </>
      )}
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        {lockChainConfig.targetConfirmations && (
          <Typography variant="caption" gutterBottom>
            Estimated processing time:{" "}
            {lockChainConfig.targetConfirmations * lockChainConfig.blockTime}{" "}
            minutes
          </Typography>
        )}
        <Box mt={2}>
          <QrCodeIconButton onClick={toggleQr} />
        </Box>
      </Box>
    </>
  );
};

type MintDepositConfirmationStatusProps = {
  tx: GatewaySession;
};

export const MintDepositConfirmationStatus: FunctionComponent<MintDepositConfirmationStatusProps> = ({
  tx,
}) => {
  const [, setTitle] = usePaperTitle();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxLink,
    lockTxAmount,
    lockConfirmations,
    lockTargetConfirmations,
    lockProcessingTime,
  } = getLockAndMintParams(tx);
  const { MainIcon } = lockChainConfig;
  const confirmed = lockConfirmations === lockTargetConfirmations;
  useEffect(() => {
    setTitle(confirmed ? "Confirmed" : "Confirming");
  }, [setTitle, confirmed]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={lockCurrencyConfig.color || orangeLight}
          confirmations={lockConfirmations}
          targetConfirmations={lockTargetConfirmations}
        >
          <MainIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        {lockConfirmations} of {lockTargetConfirmations} confirmations
      </Typography>
      <BigAssetAmount
        value={
          <NumberFormatText
            value={lockTxAmount}
            spacedSuffix={lockCurrencyConfig.short}
          />
        }
      />
      <TransactionDetailsButton
        chain={lockChainConfig.short}
        address={lockTxHash}
        link={lockTxLink}
      />
      <ProcessingTimeWrapper>
        <Typography variant="caption" component="p" align="center">
          Estimated time remaining: {lockProcessingTime} minutes
        </Typography>
      </ProcessingTimeWrapper>
    </>
  );
};

const maxConfirmations = (actual: number, target: number) => {
  if (actual > target) {
    return target;
  }
  return actual;
};

type MintDepositAcceptedStatusProps = {
  tx: GatewaySession;
  onSubmit?: () => void;
  submitting: boolean;
};

export const MintDepositAcceptedStatus: FunctionComponent<MintDepositAcceptedStatusProps> = ({
  tx,
  onSubmit = () => {},
  submitting,
}) => {
  useSetPaperTitle("Submit");
  useSetActionRequired(true);
  const theme = useTheme();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxAmount,
    lockTxLink,
    lockConfirmations,
    lockTargetConfirmations,
    mintChainConfig,
  } = getLockAndMintParams(tx);

  const notificationMessage = `${maxConfirmations(
    lockConfirmations,
    lockTargetConfirmations
  )}/${lockTargetConfirmations} confirmations, ready to submit ${
    lockCurrencyConfig.short
  } to ${mintChainConfig.full}?`;
  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();
  useEffectOnce(() => {
    showNotification(notificationMessage);
    showBrowserNotification(notificationMessage);
  });

  const { MainIcon } = lockChainConfig;

  return (
    <>
      <ProgressWrapper>
        {submitting ? (
          <ProgressWithContent color={theme.customColors.skyBlue} processing>
            <MainIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        ) : (
          <ProgressWithContent
            color={lockCurrencyConfig.color || theme.customColors.skyBlue}
            confirmations={lockConfirmations}
            targetConfirmations={lockTargetConfirmations}
          >
            <MainIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        )}
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={lockTxAmount}
          spacedSuffix={lockCurrencyConfig.full}
        />{" "}
        Received
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting" : "Submit"} to {mintChainConfig.full}
          {submitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        <TransactionDetailsButton
          chain={lockChainConfig.short}
          address={lockTxHash}
          link={lockTxLink}
        />
      </ActionButtonWrapper>
    </>
  );
};

type DestinationPendingStatusProps = {
  tx: GatewaySession;
  onSubmit?: () => void;
  submitting: boolean;
};

export const DestinationPendingStatus: FunctionComponent<DestinationPendingStatusProps> = ({
  tx,
  onSubmit = () => {},
  submitting,
}) => {
  const theme = useTheme();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxAmount,
    lockTxLink,
    mintTxHash,
    mintChainConfig,
  } = getLockAndMintParams(tx);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.customColors.skyBlue} processing>
          <TransactionStatusInfo
            status="Pending"
            chain={mintChainConfig.full}
            address={mintTxHash}
          />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={lockTxAmount}
          spacedSuffix={lockCurrencyConfig.full}
        />
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting" : "Submit"} to {mintChainConfig.full}
          {submitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        <TransactionDetailsButton
          chain={lockChainConfig.symbol}
          address={lockTxHash}
          link={lockTxLink}
        />
      </ActionButtonWrapper>
    </>
  );
};

type MintCompletedStatusProps = {
  tx: GatewaySession;
};

export const MintCompletedStatus: FunctionComponent<MintCompletedStatusProps> = ({
  tx,
}) => {
  useSetPaperTitle("Complete");
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    lockCurrencyConfig,
    mintCurrencyConfig,
    lockChainConfig,
    lockTxLink,
    lockTxAmount,
    mintTxLink,
    mintChainConfig,
  } = getLockAndMintParams(tx);
  const { fees, pending } = useFetchFees(
    lockCurrencyConfig.symbol,
    TxType.MINT
  );
  const { conversionTotal } = getTransactionFees({
    amount: lockTxAmount,
    fees,
    type: TxType.MINT,
  });
  const handleReturn = useCallback(() => {
    history.push(paths.MINT);
    dispatch(resetMint());
  }, [dispatch, history]);

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const showNotifications = useCallback(() => {
    if (!pending) {
      const notificationMessage = `Successfully minted ${conversionTotal} ${mintCurrencyConfig.short} on ${mintChainConfig.full}.`;
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={mintTxLink}>
            View {mintChainConfig.full} transaction
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    pending,
    conversionTotal,
    mintChainConfig,
    mintCurrencyConfig,
    mintTxLink,
  ]);

  useEffect(showNotifications, [pending]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={conversionTotal}
          spacedSuffix={mintCurrencyConfig.short}
        />{" "}
        received!
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={handleReturn}>Return</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={lockTxLink}
        >
          {lockChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={mintTxLink}
        >
          {mintChainConfig.full} transaction
        </Link>
      </Box>
    </>
  );
};
