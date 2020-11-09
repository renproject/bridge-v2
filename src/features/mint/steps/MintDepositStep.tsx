import {
  Box,
  Divider,
  Grow,
  IconButton,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  depositMachine,
  DepositMachineSchema,
  GatewaySession,
  GatewayTransaction,
} from "@renproject/rentx";
import QRCode from "qrcode.react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actor } from "xstate";
import {
  ActionButton,
  ActionButtonWrapper,
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  ToggleIconButton,
  TransactionDetailsButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { getChainIcon } from "../../../components/icons/IconHelpers";
import { BackArrowIcon, BitcoinIcon } from "../../../components/icons/RenIcons";
import {
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
import { Link } from "../../../components/links/Links";
import {
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { BridgeChain, BridgeCurrency } from "../../../components/utils/types";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { useNotifications } from "../../../providers/Notifications";
import { orangeLight } from "../../../theme/colors";
import {
  getChainConfig,
  getChainConfigByRentxName,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
  getCurrencyShortLabel,
  getCurrencySourceChain,
} from "../../../utils/assetConfigs";
import { setFlowStep } from "../../flow/flowSlice";
import { FlowStep } from "../../flow/flowTypes";
import { useGasPrices } from "../../marketData/marketDataHooks";
import {
  BookmarkPageWarning,
  ProcessingTimeWrapper,
} from "../../transactions/components/TransactionsHelpers";
import { useTxParam } from "../../transactions/transactionsUtils";
import { setWalletPickerOpened } from "../../wallet/walletSlice";
import { $mint } from "../mintSlice";
import { useMintMachine } from "../mintUtils";
import { MintFees } from "./MintFeesStep";

export const MintDepositStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const { currency } = useSelector($mint);
  const { tx: parsedTx, txState } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); //TODO fix this

  const handlePreviousStepClick = useCallback(() => {
    // TODO: warn if dangerous
    dispatch(setFlowStep(FlowStep.FEES));
  }, [dispatch]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const walletConnected = status === "connected";
  const showTransactionStatus = !!tx && walletConnected;
  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={handlePreviousStepClick}>
            <BackArrowIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Send {getCurrencyShortLabel(currency)}</PaperTitle>
        <PaperActions>
          <ToggleIconButton variant="settings" />
          <ToggleIconButton variant="notifications" />
        </PaperActions>
      </PaperHeader>
      <PaperContent bottomPadding>
        {showTransactionStatus && <MintTransactionStatus tx={tx} />}
        {!walletConnected && (
          <ActionButton onClick={handleWalletPickerOpen}>
            Connect Wallet
          </ActionButton>
        )}
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <MintFees />
        <Debug it={{ parsedTx }} />
      </PaperContent>
      {txState?.newTx && <BookmarkPageWarning />}
    </>
  );
};

type MintTransactionStatusProps = {
  tx: GatewaySession;
};

const getAddressValidityMessage = (expiryTime: number) => {
  const time = Math.floor((expiryTime - Number(new Date())) / 1000 / 3600);
  const unit = "hours";
  return `This Gateway Address is only valid for ${time} ${unit}. Do not send multiple deposits or deposit after ${time} ${unit}.`;
};

const MintTransactionStatus: FunctionComponent<MintTransactionStatusProps> = ({
  tx,
}) => {
  const [current] = useMintMachine(tx);
  const { showNotification } = useNotifications();
  useEffect(() => {
    showNotification(getAddressValidityMessage(tx.expiryTime), {
      variant: "warning",
    });
  }, [showNotification, tx.expiryTime]);

  const activeDeposit = useMemo<{
    deposit: GatewayTransaction;
    machine: Actor<typeof depositMachine>;
  } | null>(() => {
    const deposit = Object.values(current.context.tx.transactions)[0];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    return { deposit, machine };
  }, [current.context]);

  return (
    <>
      {activeDeposit ? (
        <DepositStatus
          tx={current.context.tx}
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      ) : (
        <DepositTo
          amount={Number(current.context.tx.suggestedAmount) / 1e8}
          currency={
            getCurrencyConfigByRentxName(current.context.tx.sourceAsset).symbol
          }
          gatewayAddress={current.context.tx.gatewayAddress}
          processingTime={60} // TODO: calculate
        />
      )}
      <Debug it={{ contextTx: current.context.tx, activeDeposit }} />
    </>
  );
};

type DepositToProps = {
  amount: number;
  currency: BridgeCurrency;
  gatewayAddress?: string;
  processingTime: number;
};

const DepositTo: FunctionComponent<DepositToProps> = ({
  amount,
  currency,
  gatewayAddress,
  processingTime,
}) => {
  const [showQr, setShowQr] = useState(false);
  const toggleQr = useCallback(() => {
    setShowQr(!showQr);
  }, [showQr]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={orangeLight} size={64}>
          <BitcoinIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <MediumWrapper>
        <BigAssetAmount
          value={
            <span>
              Send <NumberFormatText value={amount} spacedSuffix={currency} />{" "}
              to
            </span>
          }
        />
      </MediumWrapper>
      {!!gatewayAddress && (
        <>
          {showQr && (
            <CenteringSpacedBox>
              <Grow in={showQr}>
                <BigQrCode>
                  <QRCode value={gatewayAddress} />
                </BigQrCode>
              </Grow>
            </CenteringSpacedBox>
          )}
          <CopyContentButton content={gatewayAddress} />
        </>
      )}
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="caption" gutterBottom>
          Estimated processing time: {processingTime} minutes
        </Typography>
        <Box mt={2}>
          <QrCodeIconButton onClick={toggleQr} />
        </Box>
      </Box>
    </>
  );
};

type DepositStatusProps = {
  tx: GatewaySession;
  deposit: GatewayTransaction;
  machine: Actor<typeof depositMachine>;
};

export const forceState = "srcConfirmed" as keyof DepositMachineSchema["states"];

export const DepositStatus: FunctionComponent<DepositStatusProps> = ({
  tx,
  deposit,
  machine,
}) => {
  const handleSubmitToDestinationChain = useCallback(() => {
    machine?.send({ type: "CLAIM" });
  }, [machine]);

  if (!machine) {
    return <div>Transaction completed</div>;
  }
  console.log("msv", machine.state.value);
  const sourceCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const sourceChainConfig = getChainConfigByRentxName(tx.sourceNetwork);
  const destinationChainConfig = getChainConfigByRentxName(tx.destNetwork);
  // const destinationCurrencyConfig = getCurrencyConfigByRentxName(
  //   machine.state.context.tx.destAsset
  // );
  const stateValue = machine.state
    .value as keyof DepositMachineSchema["states"];
  switch (stateValue) {
    // switch (forceState) {
    case "srcSettling":
      return (
        <>
          <DepositConfirmationStatus
            currency={sourceCurrencyConfig.symbol}
            confirmations={deposit.sourceTxConfs % 6}
            targetConfirmations={deposit.sourceTxConfTarget}
            amount={Number(deposit.sourceTxAmount) / 1e8}
            txHash={deposit.sourceTxHash}
            timeRemaining={
              Math.max(
                Number(deposit.sourceTxConfTarget) - deposit.sourceTxConfs,
                0
              ) * Number(sourceCurrencyConfig.sourceConfirmationTime) || 0
            }
          />
        </>
      );
    case "srcConfirmed": // source chain confirmations ok, but renVM still doesn't accept it
    case "claiming":
    case "accepted": // RenVM accepted it, it can be submitted to ethereum
      return (
        <DepositAcceptedStatus
          sourceCurrency={sourceCurrencyConfig.symbol}
          sourceAmount={deposit.sourceTxAmount / 1e8}
          sourceChain={sourceChainConfig.symbol}
          sourceTxHash={deposit.sourceTxHash}
          sourceConfirmations={deposit.sourceTxConfs}
          sourceConfirmationsTarget={6} // TODO: resolve
          destinationChain={destinationChainConfig.symbol}
          onSubmit={handleSubmitToDestinationChain}
          submitting={stateValue === "claiming"}
        />
      );
    case "destInitiated": // final txHash means its done or check if wat balances go up.
      return (
        <>
          <DestinationPendingStatus
            sourceCurrency={sourceCurrencyConfig.symbol}
            sourceAmount={deposit.sourceTxAmount / 1e8}
            sourceChain={sourceChainConfig.symbol}
            sourceTxHash={deposit.sourceTxHash}
            destinationChain={destinationChainConfig.symbol}
            onSubmit={handleSubmitToDestinationChain}
            submitting={true}
            destinationTxHash={deposit.destTxHash || ""}
          />
        </>
      );
    case "restoringDeposit":
      return <ProgressStatus reason="Restoring..." />;
    default:
      return <ProgressStatus reason={machine.state.value} />;
  }
};

/*
msv accepted
msv claiming
msv destInitiated
 */

type ProgressStatusProps = {
  reason?: string;
  processing?: boolean;
};

export const ProgressStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading...",
  processing = true,
}) => {
  const theme = useTheme();
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
  currency: BridgeCurrency;
  confirmations: number;
  targetConfirmations?: number;
  amount: number;
  txHash: string;
  timeRemaining: number;
};

export const DepositConfirmationStatus: FunctionComponent<DepositConfirmationStatusProps> = ({
  currency,
  confirmations,
  targetConfirmations,
  amount,
  txHash,
  timeRemaining,
}) => {
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
  sourceCurrency: BridgeCurrency;
  sourceAmount: number;
  sourceChain: BridgeChain;
  sourceTxHash: string;
  sourceConfirmations: number;
  sourceConfirmationsTarget: number;
  destinationChain: BridgeChain;
  onSubmit?: () => void;
  submitting: boolean;
};

export const DepositAcceptedStatus: FunctionComponent<DepositAcceptedStatusProps> = ({
  sourceCurrency,
  sourceAmount,
  sourceChain,
  sourceTxHash,
  sourceConfirmations,
  sourceConfirmationsTarget = 6, // TODO: resolve from config or tx
  destinationChain,
  onSubmit = () => {},
  submitting,
}) => {
  const theme = useTheme();
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const destinationChainConfig = getChainConfig(destinationChain);
  const Icon = getChainIcon(sourceChain);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={sourceCurrencyConfig.color || theme.customColors.skyBlue}
          confirmations={sourceConfirmations}
          targetConfirmations={sourceConfirmationsTarget}
        >
          <Icon fontSize="inherit" color="inherit" />
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
        <TransactionDetailsButton chain={sourceChain} address={sourceTxHash} />
      </ActionButtonWrapper>
    </>
  );
};

type DestinationPendingStatusProps = {
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
        <TransactionDetailsButton chain={sourceChain} address={sourceTxHash} />
      </ActionButtonWrapper>
    </>
  );
};

type DestinationReceivedStatusProps = {
  sourceChain: BridgeChain;
  sourceTxHash: string;
  destinationCurrency: BridgeCurrency;
  destinationChain: BridgeChain;
  destinationAmount: number;
  destinationTxHash: string;
  onReturn?: () => void;
};

export const DestinationReceivedStatus: FunctionComponent<DestinationReceivedStatusProps> = ({
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

  const sourceTxLink = `http://example.com/` + sourceTxHash;
  const destinationTxLink = `http://example.com/` + destinationTxHash;

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.palette.primary.main}>
          <TransactionStatusInfo
            status="Pending"
            chain={destinationChainConfig.full}
            address={destinationTxHash}
          />
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
        >
          Ethereum transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={destinationTxLink}
        >
          Bitcoin transaction
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
