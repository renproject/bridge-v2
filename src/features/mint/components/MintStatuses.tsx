import { Box, Typography, useTheme } from "@material-ui/core";
import React, { FunctionComponent, useEffect } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
  TransactionDetailsButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { getChainIcon } from "../../../components/icons/IconHelpers";
import {
  BitcoinIcon,
  MetamaskFullIcon,
} from "../../../components/icons/RenIcons";
import { Link } from "../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../components/typography/TypographyHelpers";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
} from "../../../components/utils/types";
import { orangeLight } from "../../../theme/colors";
import {
  getChainConfig,
  getCurrencyConfig,
  getCurrencyShortLabel,
  getCurrencySourceChain,
} from "../../../utils/assetConfigs";
import { ProcessingTimeWrapper } from "../../transactions/components/TransactionsHelpers";
import { getChainExplorerLink } from "../../transactions/transactionsUtils";
import { usePaperTitle } from "../mintUtils";

type ProgressStatusProps = {
  reason?: string;
  processing?: boolean;
};

export const ProgressStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading...",
  processing = true,
}) => {
  const theme = useTheme();
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(reason);
  }, [setTitle, reason]);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          processing={processing}
          color={theme.palette.primary.main}
        >
          <TransactionStatusInfo status={reason} />
        </ProgressWithContent>
      </ProgressWrapper>
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

export const SrcConfirmedStatus: FunctionComponent = () => {
  const theme = useTheme();
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent processing color={theme.palette.primary.main}>
          <TransactionStatusInfo status="Pending..." />
        </ProgressWithContent>
      </ProgressWrapper>
    </>
  );
};
