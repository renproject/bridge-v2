import { Box, Grow, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import QRCode from "qrcode.react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  BitcoinIcon,
  MetamaskFullIcon,
} from "../../../components/icons/RenIcons";
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
import { usePaperTitle, useSetPaperTitle } from "../../../pages/MainPage";
import { useNotifications } from "../../../providers/Notifications";
import { orangeLight } from "../../../theme/colors";
import { ProcessingTimeWrapper } from "../../transactions/components/TransactionsHelpers";
import { getLockAndMintParams } from "../mintUtils";

const getAddressValidityMessage = (expiryTime: number) => {
  const time = Math.ceil((expiryTime - Number(new Date())) / 1000 / 3600);
  const unit = "hours";
  return `This Gateway Address is only valid for ${time} ${unit}. Do not send multiple deposits or deposit after ${time} ${unit}.`;
};

export type DepositToProps = {
  tx: GatewaySession;
};

export const DepositTo: FunctionComponent<DepositToProps> = ({ tx }) => {
  const [showQr, setShowQr] = useState(false);
  const toggleQr = useCallback(() => {
    setShowQr(!showQr);
  }, [showQr]);
  const { showNotification } = useNotifications();
  useEffect(() => {
    showNotification(getAddressValidityMessage(tx.expiryTime), {
      variant: "warning",
    });
  }, [showNotification, tx.expiryTime]);

  const {
    lockCurrencyConfig,
    lockChainConfig,
    suggestedAmount,
  } = getLockAndMintParams(tx);
  const { color } = lockCurrencyConfig;
  const { MainIcon } = lockChainConfig;

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
                  <QRCode value={tx.gatewayAddress} />
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

type DepositConfirmationStatusProps = {
  tx: GatewaySession;
};

export const DepositConfirmationStatus: FunctionComponent<DepositConfirmationStatusProps> = ({
  tx,
}) => {
  const [, setTitle] = usePaperTitle();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxLink,
    lockConfirmations,
    lockTargetConfirmations,
    lockProcessingTime,
    suggestedAmount,
  } = getLockAndMintParams(tx);

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
          <BitcoinIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        {lockConfirmations} of {lockTargetConfirmations} confirmations
      </Typography>
      <BigAssetAmount
        value={
          <NumberFormatText
            value={suggestedAmount}
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

type DepositAcceptedStatusProps = {
  tx: GatewaySession;
  onSubmit?: () => void;
  submitting: boolean;
};

export const DepositAcceptedStatus: FunctionComponent<DepositAcceptedStatusProps> = ({
  tx,
  onSubmit = () => {},
  submitting,
}) => {
  useSetPaperTitle("Submit");
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

  const { MainIcon } = lockChainConfig;
  return (
    <>
      <ProgressWrapper>
        {submitting ? (
          <ProgressWithContent color={theme.customColors.skyBlue} processing>
            <MetamaskFullIcon fontSize="inherit" color="inherit" />
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

type DestinationReceivedStatusProps = {
  tx: GatewaySession;
  onReturn?: () => void;
};

export const DestinationReceivedStatus: FunctionComponent<DestinationReceivedStatusProps> = ({
  tx,
  onReturn = () => {},
}) => {
  const theme = useTheme();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxLink,
    mintTxLink,
    mintChainConfig,
  } = getLockAndMintParams(tx);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.palette.primary.main}>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={tx.targetAmount}
          spacedSuffix={lockCurrencyConfig.full}
        />
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onReturn}>Return</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" py={2}>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={lockTxLink}
          target="_blank"
        >
          {lockChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={mintTxLink}
          target="_blank"
        >
          {mintChainConfig.full} transaction
        </Link>
      </Box>
    </>
  );
};
