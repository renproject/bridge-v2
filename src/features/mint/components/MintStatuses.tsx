import { Box, Grow, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/rentx";
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
import { getChainIcon } from "../../../components/icons/IconHelpers";
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
import { usePaperTitle } from "../../../pages/MainPage";
import { useNotifications } from "../../../providers/Notifications";
import { orangeLight } from "../../../theme/colors";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
  getChainConfig,
  getCurrencyConfig,
  getCurrencyShortLabel,
  getCurrencySourceChain,
} from "../../../utils/assetConfigs";
import { ProcessingTimeWrapper } from "../../transactions/components/TransactionsHelpers";
import { getChainExplorerLink } from "../../transactions/transactionsUtils";
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
  network: BridgeNetwork;
  sourceChain: BridgeChain;
  currency: BridgeCurrency;
  confirmations: number;
  targetConfirmations?: number;
  amount: number;
  txHash: string;
  timeRemaining: number;
};

export const DepositConfirmationStatus: FunctionComponent<DepositConfirmationStatusProps> = ({
  network,
  sourceChain,
  currency,
  confirmations,
  targetConfirmations,
  amount,
  txHash,
  timeRemaining,
}) => {
  const [, setTitle] = usePaperTitle();
  const confirmed = confirmations === targetConfirmations;
  useEffect(() => {
    setTitle(confirmed ? "Confirmed" : "Confirming");
  }, [setTitle, confirmed]);
  const sourceTxExplorerLink = getChainExplorerLink(
    sourceChain,
    network,
    txHash
  ); //TODO: renane props end inject
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={orangeLight}
          confirmations={confirmations}
          targetConfirmations={targetConfirmations}
        >
          <BitcoinIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        {confirmations} of {targetConfirmations} confirmations
      </Typography>
      <BigAssetAmount
        value={
          <NumberFormatText
            value={amount}
            spacedSuffix={getCurrencyShortLabel(currency)}
          />
        }
      />
      <TransactionDetailsButton
        chain={getCurrencySourceChain(currency)}
        address={txHash}
        link={sourceTxExplorerLink}
      />
      <ProcessingTimeWrapper>
        <Typography variant="caption" component="p" align="center">
          Estimated time remaining: {timeRemaining} minutes
        </Typography>
      </ProcessingTimeWrapper>
    </>
  );
};

type DepositAcceptedStatusProps = {
  network: BridgeNetwork;
  sourceCurrency: BridgeCurrency;
  sourceAmount: number;
  sourceChain: BridgeChain;
  sourceTxHash: string;
  sourceConfirmations: number;
  sourceConfirmationsTarget?: number;
  destinationChain: BridgeChain;
  onSubmit?: () => void;
  submitting: boolean;
};

export const DepositAcceptedStatus: FunctionComponent<DepositAcceptedStatusProps> = ({
  network, // TODO inject
  sourceCurrency,
  sourceAmount,
  sourceChain,
  sourceTxHash,
  sourceConfirmations,
  sourceConfirmationsTarget,
  destinationChain,
  onSubmit = () => {},
  submitting,
}) => {
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle("Submit");
  }, [setTitle]);
  const theme = useTheme();
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const destinationChainConfig = getChainConfig(destinationChain);
  const sourceChainConfig = getChainConfig(sourceChain);
  const Icon = getChainIcon(sourceChain);
  const sourceTxExplorerLink = getChainExplorerLink(
    sourceChain,
    network,
    sourceTxHash
  );
  return (
    <>
      <ProgressWrapper>
        {submitting ? (
          <ProgressWithContent color={theme.customColors.skyBlue} processing>
            <MetamaskFullIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        ) : (
          <ProgressWithContent
            color={sourceCurrencyConfig.color || theme.customColors.skyBlue}
            confirmations={sourceConfirmations}
            targetConfirmations={sourceConfirmationsTarget}
          >
            <Icon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        )}
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={sourceAmount}
          spacedSuffix={sourceCurrencyConfig.full}
        />{" "}
        Received
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"} to{" "}
          {destinationChainConfig.full}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        <TransactionDetailsButton
          chain={sourceChainConfig.short}
          address={sourceTxHash}
          link={sourceTxExplorerLink}
        />
      </ActionButtonWrapper>
    </>
  );
};

type DestinationPendingStatusProps = {
  network: BridgeNetwork;
  sourceCurrency: BridgeCurrency;
  sourceAmount: number;
  sourceChain: BridgeChain;
  sourceTxHash: string;
  destinationChain: BridgeChain;
  destinationTxHash: string;
  onSubmit?: () => void;
  submitting: boolean;
};

export const DestinationPendingStatus: FunctionComponent<DestinationPendingStatusProps> = ({
  network,
  sourceCurrency,
  sourceAmount,
  sourceChain,
  sourceTxHash,
  destinationChain,
  destinationTxHash,
  onSubmit = () => {},
  submitting,
}) => {
  const theme = useTheme();
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const destinationChainConfig = getChainConfig(destinationChain);
  const sourceTxExplorerLink = getChainExplorerLink(
    sourceChain,
    network,
    sourceTxHash
  );
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.customColors.skyBlue} processing>
          <TransactionStatusInfo
            status="Pending"
            chain={destinationChainConfig.full}
            address={destinationTxHash}
          />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={sourceAmount}
          spacedSuffix={sourceCurrencyConfig.full}
        />
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"} to{" "}
          {destinationChainConfig.full}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        <TransactionDetailsButton
          chain={sourceChain}
          address={sourceTxHash}
          link={sourceTxExplorerLink}
        />
      </ActionButtonWrapper>
    </>
  );
};

type DestinationReceivedStatusProps = {
  network: BridgeNetwork;
  sourceCurrency: BridgeCurrency;
  sourceChain: BridgeChain;
  sourceTxHash: string;
  destinationCurrency: BridgeCurrency;
  destinationChain: BridgeChain;
  destinationAmount: number;
  destinationTxHash: string;
  onReturn?: () => void;
};

export const DestinationReceivedStatus: FunctionComponent<DestinationReceivedStatusProps> = ({
  network,
  sourceChain,
  sourceTxHash,
  destinationCurrency,
  destinationAmount,
  destinationChain,
  destinationTxHash,
  onReturn = () => {},
}) => {
  const theme = useTheme();
  const destinationCurrencyConfig = getCurrencyConfig(destinationCurrency);
  const destinationChainConfig = getChainConfig(destinationChain);
  const sourceChainConfig = getChainConfig(sourceChain);

  const sourceTxLink = getChainExplorerLink(sourceChain, network, sourceTxHash);
  const destinationTxLink = getChainExplorerLink(
    destinationChain,
    network,
    destinationTxHash
  );

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.palette.primary.main}>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={destinationAmount}
          spacedSuffix={destinationCurrencyConfig.full}
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
          href={sourceTxLink}
          target="_blank"
        >
          {sourceChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={destinationTxLink}
          target="_blank"
        >
          {destinationChainConfig.full} transaction
        </Link>
      </Box>
    </>
  );
};
