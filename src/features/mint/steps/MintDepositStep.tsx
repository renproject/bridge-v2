import {
  Box,
  Divider,
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
  CopyContentButton,
  QrCodeIconButton,
  ToggleIconButton,
  TransactionDetailsButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon, BitcoinIcon } from "../../../components/icons/RenIcons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper, TransactionStatusInfo,
} from '../../../components/progress/ProgressHelpers'
import {
  BigAssetAmount,
  BigAssetAmountWrapper,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { BridgeCurrency } from "../../../components/utils/types";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { useNotifications } from "../../../providers/Notifications";
import { orangeLight } from "../../../theme/colors";
import {
  getCurrencyConfigByRentxName,
  getCurrencyShortLabel,
  getCurrencySourceChain,
} from "../../../utils/assetConfigs";
import { setFlowStep } from "../../flow/flowSlice";
import { FlowStep } from "../../flow/flowTypes";
import { useGasPrices } from "../../marketData/marketDataHooks";
import { ProcessingTimeWrapper } from "../../transactions/components/TransactionsHelpers";
import { useTxParam } from "../../transactions/transactionsUtils";
import { $mint } from "../mintSlice";
import { useMintMachine } from "../mintUtils";
import { MintFees } from "./MintFeesStep";

export const MintDepositStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const { currency } = useSelector($mint);
  const { tx: parsedTx } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); //TODO fix this

  const handlePreviousStepClick = useCallback(() => {
    // TODO: warn if dangerous
    dispatch(setFlowStep(FlowStep.FEES));
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
        {!walletConnected && <span>connect wallet</span>}
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <MintFees />
        <Debug it={{ parsedTx }} />
      </PaperContent>
    </>
  );
};

type MintTransactionStatusProps = {
  tx: GatewaySession;
};

const gatewayAddressValidMessage =
  "This Gateway Address is only valid for 24 hours. Do not send multiple deposits or deposit after 24 hours.";

const MintTransactionStatus: FunctionComponent<MintTransactionStatusProps> = ({
  tx,
}) => {
  const [current] = useMintMachine(tx);
  const { showNotification } = useNotifications();
  useEffect(() => {
    showNotification(gatewayAddressValidMessage, { variant: "warning" });
  }, [showNotification]);

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
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={orangeLight} size={64}>
          <BitcoinIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <BigAssetAmountWrapper>
        <BigAssetAmount
          value={
            <span>
              Send <NumberFormatText value={amount} spacedSuffix={currency} />{" "}
              to
            </span>
          }
        />
      </BigAssetAmountWrapper>
      {!!gatewayAddress && <CopyContentButton content={gatewayAddress} />}
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
          <QrCodeIconButton />
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

export const forceState = "loading" as keyof DepositMachineSchema["states"];

export const DepositStatus: FunctionComponent<DepositStatusProps> = ({
  tx,
  deposit,
  machine,
}) => {
  if (!machine) {
    return <div>Transaction completed</div>;
  }
  console.log("msv", machine.state.value);
  const sourceCurrency = getCurrencyConfigByRentxName(tx.sourceAsset);
  // switch (machine.state.value as keyof DepositMachineSchema["states"]) {
  switch (forceState) {
    case "srcSettling":
      return (
        <>
          <DepositConfirmationStatus
            currency={sourceCurrency.symbol}
            confirmations={deposit.sourceTxConfs % 6}
            targetConfirmations={deposit.sourceTxConfTarget}
            amount={Number(deposit.sourceTxAmount) / 1e8}
            txHash={deposit.sourceTxHash}
            timeRemaining={
              Math.max(
                Number(deposit.sourceTxConfTarget) - deposit.sourceTxConfs,
                0
              ) * Number(sourceCurrency.sourceConfirmationTime) || 0
            }
          />
        </>
      );
    case "srcConfirmed":
      return <div>Submitting to RenVM</div>;
    case "accepted":
      return (
        <div>
          Mint {deposit.sourceTxAmount / 1e8}{" "}
          {machine.state.context.tx.destAsset}?
        </div>
      );
    case "claiming":
      return <div>Signing mint transaction...</div>;
    case "destInitiated":
      return (
        <div>Your assets are on their way. TxHash: {deposit.destTxHash}</div>
      );
    default:
      return <LoadingStatus />;
  }
};

type DepositConfirmationStatusProps = {
  currency: BridgeCurrency;
  confirmations: number;
  targetConfirmations?: number;
  amount: number;
  txHash: string;
  timeRemaining: number;
};

export const LoadingStatus: FunctionComponent = () => {
  const theme = useTheme();
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent processing color={theme.palette.primary.main}>
          <TransactionStatusInfo status="Loading..." />
        </ProgressWithContent>
      </ProgressWrapper>
    </>
  );
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
